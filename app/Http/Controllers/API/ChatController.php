<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Mail\ChatLeadMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    /**
     * Supprime les astérisques et tirets de formatage markdown dans les réponses IA
     */
    private function cleanBulletPoints(string $text): string
    {
        // Supprime les puces markdown
        $text = preg_replace('/^[\s]*[\*\-][\s]+/m', '', $text);
        $text = preg_replace('/[\s]+[\*\-][\s]+/', ' ', $text);
        $text = preg_replace('/[\s]*[\*\-][\s]*/', '', $text);
        // Supprime les emojis et symboles Unicode décoratifs
        $text = preg_replace('/[\x{1F000}-\x{1FFFF}\x{2600}-\x{27BF}\x{FE00}-\x{FEFF}]/u', '', $text);
        // Normalise les espaces
        $text = preg_replace('/\s+/', ' ', $text);
        $text = preg_replace('/^\s+|\s+$/m', '', $text);
        return trim($text);
    }

    /**
     * Extrait et sauvegarde les coordonnées d'un prospect depuis un message
     */
    private function extractLeadDetails(ChatConversation $conversation, string $text): bool
    {
        $updated = false;

        // Email
        if (!$conversation->lead_email && preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $text, $emailMatches)) {
            $conversation->lead_email = strtolower($emailMatches[0]);
            $updated = true;
        }

        // Numéro de téléphone / WhatsApp (min 8 chiffres)
        if (!$conversation->lead_phone && preg_match('/(?:\+?\d{1,4}[\s.\-]?)?(?:\(?\d{2,4}\)?[\s.\-]?)?\d{2,4}[\s.\-]?\d{2,4}[\s.\-]?\d{2,4}/', $text, $phoneMatches)) {
            $digitsOnly = preg_replace('/[^\d]/', '', $phoneMatches[0]);
            if (strlen($digitsOnly) >= 8) {
                $conversation->lead_phone = trim($phoneMatches[0]);
                $updated = true;
            }
        }

        // Prénom / Nom : détecte un mot capitalisé isolé ou précédé de "je m'appelle", "c'est", "prénom"
        if (!$conversation->lead_name) {
            if (preg_match('/(?:je m\'appelle|mon (?:pr[eé]nom|nom)(?: est)?|c\'est|appelle[z-]?\s*moi)[\s:]+([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s[A-ZÀ-Ÿ][a-zà-ÿ]+)?)/u', $text, $nameMatches)) {
                $conversation->lead_name = trim($nameMatches[1]);
                $updated = true;
            }
        }

        if ($updated) {
            $conversation->status = 'lead_captured';
            $conversation->save();
            $this->notifyLeadCapture($conversation);
        }

        return $updated;
    }

    /**
     * Envoie un email de notification quand un prospect laisse ses coordonnées
     */
    private function notifyLeadCapture(ChatConversation $conversation): void
    {
        if ($conversation->lead_notified) {
            return;
        }
        if (!$conversation->lead_email && !$conversation->lead_phone) {
            return;
        }
        try {
            Mail::to('veasybility7@gmail.com')->send(new ChatLeadMail($conversation));
            $conversation->lead_notified = true;
            $conversation->save();
        } catch (\Exception $e) {
            Log::error('Erreur notification email prospect: ' . $e->getMessage());
        }
    }

    /**
     * Envoi d'un message au chatbot et génération de la réponse IA
     * Les opérations DB sont toutes dans un try/catch : le chatbot répond
     * même si la base de données est temporairement indisponible.
     */
    public function ask(Request $request)
    {
        $request->validate([
            'message'    => 'required|string|max:2000',
            'session_id' => 'nullable|string|max:100',
        ]);

        $userMessage = trim($request->message);
        $sessionId   = $request->input('session_id') ?: ('cs_' . Str::random(20));

        // ── 1. Persistance en base de données (non bloquant) ──────────────
        $conversation   = null;
        $recentMessages = collect();

        try {
            $conversation = ChatConversation::firstOrCreate(
                ['session_id' => $sessionId],
                [
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'status'     => 'new',
                ]
            );

            $conversation->messages()->create([
                'sender'  => 'user',
                'message' => $userMessage,
            ]);

            $this->extractLeadDetails($conversation, $userMessage);

            $recentMessages = $conversation->messages()
                ->latest('id')
                ->take(6)
                ->get()
                ->reverse();

        } catch (\Throwable $dbEx) {
            Log::error('ChatController@ask DB error: ' . $dbEx->getMessage());
            // On continue sans DB : le chatbot reste fonctionnel
        }

        // ── 2. Construction du prompt ──────────────────────────────────────
        $leadAlreadyCaptured = $conversation
            ? (bool)($conversation->lead_email || $conversation->lead_phone)
            : false;

        $leadContext = $leadAlreadyCaptured
            ? "IMPORTANT : Le prospect a déjà fourni ses coordonnées. Ne les redemande JAMAIS. Remercie-le si c'est la première fois que tu le mentionnes dans cette session, puis continue à l'accompagner."
            : "IMPORTANT : Tu n'as pas encore les coordonnées du prospect. Ton objectif est de les obtenir naturellement au bon moment (voir règle 3)."
        ;

        $systemPrompt = <<<PROMPT
Tu es Mr Easy, le conseiller commercial attitré de Veasybility, une agence digitale full-service. Tu es le premier point de contact entre l'agence et ses prospects. Tu incarnes les valeurs de Veasybility : excellence, innovation et intégrité.

Ton caractère : tu es chaleureux, attentionné, à l'écoute, professionnel et orienté solutions. Tu traites chaque prospect comme un client VIP. Tu ne te contentes pas de répondre — tu guides, tu rassures, tu conseilles.

{$leadContext}

=== RÈGLES ABSOLUES ===

RÈGLE 1 — PÉRIMÈTRE STRICT
Tu représentes UNIQUEMENT Veasybility. Toute question hors sujet (politique, religion, vie privée, autres entreprises, etc.) est poliment déclinée et redirigée vers les services de Veasybility.

RÈGLE 2 — ZÉRO HALLUCINATION
Ne jamais inventer de chiffres, statistiques, noms de clients, délais ou résultats. Si tu n'as pas l'information, dis-le honnêtement : "Je ne dispose pas de cette information précise, mais notre équipe pourra vous répondre en détail lors d'un échange."

RÈGLE 3 — CAPTURE DE CONTACT (objectif prioritaire)
Dès qu'un prospect exprime un besoin concret, décrit un projet ou demande un devis, demande naturellement ses coordonnées UNE SEULE FOIS :
"Pour que notre équipe vous prépare une proposition personnalisée et gratuite, pourriez-vous me communiquer votre prénom ainsi que votre adresse email ou numéro WhatsApp ?"
Si le prospect fournit ses coordonnées, remercie-le sincèrement et confirme que l'équipe Veasybility le contactera dans les plus brefs délais.

RÈGLE 4 — AUCUN PRIX
Ne jamais donner de prix, fourchette ou estimation chiffrée. Chaque projet est unique. Veasybility établit des devis sur mesure et gratuits après un premier échange.

RÈGLE 5 — FORMAT STRICT
Réponds en 2 à 3 paragraphes courts et fluides. INTERDIT : astérisques (*), tirets (-), markdown, emojis, symboles décoratifs, listes à puces. Uniquement des phrases naturelles et bien construites.

RÈGLE 6 — MÉTHODE COMMERCIALE
- Commence toujours par valider le besoin ou la situation du prospect avec empathie.
- Présente ensuite la solution ou le service Veasybility adapté, en expliquant concrètement la valeur apportée.
- Termine par une invitation à passer à l'étape suivante (devis, échange, coordonnées).

=== SERVICES DE VEASYBILITY ===
Veasybility accompagne les marques et entreprises sur l'ensemble de leur présence digitale :
Création de sites web vitrines et e-commerce haut de gamme, landing pages à forte conversion, développement d'applications web et mobiles sur mesure, branding et identité visuelle complète, motion design et production vidéo professionnelle, gestion des réseaux sociaux et community management, campagnes publicitaires Meta Ads et Google Ads, SEO et AEO, stratégie de communication digitale 360°.

VALEURS : Excellence — chaque détail compte. Innovation — les meilleures technologies au service des clients. Intégrité — transparence et honnêteté à chaque étape.
PROMPT;

        $apiKey = config('services.groq.key') ?: env('GROQ_API_KEY');

        if (!$apiKey) {
            Log::error('GROQ_API_KEY manquante. Verifiez les variables d\'environnement sur Render.');
            return response()->json(['reply' => 'Service de chat temporairement indisponible. Contactez-nous directement.'], 503);
        }

        // ── 3. Construction du payload avec historique ────────────────────
        $messagesPayload = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach ($recentMessages as $msg) {
            $messagesPayload[] = [
                'role'    => $msg->sender === 'user' ? 'user' : 'assistant',
                'content' => $msg->message,
            ];
        }

        // ── 4. Appel Groq avec fallback sur un second modèle ─────────────
        $models  = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
        $payload = [
            'messages'    => $messagesPayload,
            'temperature' => 0.3,
            'max_tokens'  => 512,
        ];

        $cleanedReply = null;

        foreach ($models as $model) {
            try {
                $response = Http::withToken($apiKey)
                    ->timeout(30)
                    ->post('https://api.groq.com/openai/v1/chat/completions', array_merge($payload, ['model' => $model]));

                if ($response->successful()) {
                    $rawReply     = $response->json()['choices'][0]['message']['content'] ?? '';
                    $cleanedReply = $this->cleanBulletPoints($rawReply);
                    break;
                }

                Log::warning("Groq [{$model}] HTTP {$response->status()}: " . substr($response->body(), 0, 300));

            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                Log::error("Groq connexion impossible [{$model}]: " . $e->getMessage());
            } catch (\Throwable $e) {
                Log::error("Groq erreur inattendue [{$model}]: " . $e->getMessage());
            }
        }

        if (!$cleanedReply) {
            Log::error('Groq: tous les modeles ont echoue. API key presente: ' . (!empty($apiKey) ? 'oui' : 'non'));
            return response()->json(['reply' => 'Service temporairement indisponible. Reessayez dans un instant.'], 503);
        }

        // ── 5. Sauvegarde de la réponse en base (non bloquant) ───────────
        try {
            if ($conversation) {
                $conversation->messages()->create([
                    'sender'  => 'bot',
                    'message' => $cleanedReply,
                ]);
                $conversation->increment('messages_count', 2);
                $conversation->last_message_at = now();
                $conversation->save();

                // Nouvelle tentative d'extraction si le nom n'est pas encore capturé
                if (!$conversation->lead_name) {
                    $this->extractLeadDetails($conversation, $userMessage);
                }
            }
        } catch (\Throwable $dbEx) {
            Log::error('ChatController@ask DB save error: ' . $dbEx->getMessage());
        }

        return response()->json([
            'reply'          => $cleanedReply,
            'session_id'     => $sessionId,
            'lead_captured'  => $conversation
                ? (bool) ($conversation->lead_email || $conversation->lead_phone)
                : false,
        ]);
    }

    /**
     * Récupère l'historique d'une conversation par session_id
     */
    public function history(Request $request)
    {
        $sessionId = $request->query('session_id');

        if (!$sessionId) {
            return response()->json(['messages' => [], 'lead_captured' => false]);
        }

        try {
            $conversation = ChatConversation::where('session_id', $sessionId)->first();

            if (!$conversation) {
                return response()->json(['messages' => [], 'lead_captured' => false]);
            }

            $messages = $conversation->messages()
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(function ($m) {
                    return [
                        'text'  => $m->message,
                        'isBot' => $m->sender === 'bot',
                        'time'  => $m->created_at->format('H:i'),
                    ];
                });

            return response()->json([
                'messages'      => $messages,
                'session_id'    => $conversation->session_id,
                'lead_captured' => (bool) ($conversation->lead_email || $conversation->lead_phone),
                'lead_name'     => $conversation->lead_name,
                'lead_email'    => $conversation->lead_email,
                'lead_phone'    => $conversation->lead_phone,
            ]);

        } catch (\Throwable $e) {
            Log::error('ChatController@history error: ' . $e->getMessage());
            return response()->json(['messages' => [], 'lead_captured' => false]);
        }
    }

    /**
     * Enregistre manuellement les coordonnées d'un prospect (formulaire "Rappel")
     */
    public function saveLead(Request $request)
    {
        $validated = $request->validate([
            'session_id' => 'required|string|max:100',
            'name'       => 'nullable|string|max:255',
            'email'      => 'nullable|email|max:255',
            'phone'      => 'nullable|string|max:50',
        ]);

        try {
            $conversation = ChatConversation::firstOrCreate(
                ['session_id' => $validated['session_id']],
                [
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'status'     => 'new',
                ]
            );

            if (!empty($validated['name']))  { $conversation->lead_name  = $validated['name']; }
            if (!empty($validated['email'])) { $conversation->lead_email = strtolower($validated['email']); }
            if (!empty($validated['phone'])) { $conversation->lead_phone = $validated['phone']; }

            $conversation->status = 'lead_captured';
            $conversation->save();

            $this->notifyLeadCapture($conversation);

            return response()->json([
                'success' => true,
                'message' => 'Coordonnees enregistrees avec succes.',
                'lead'    => [
                    'name'  => $conversation->lead_name,
                    'email' => $conversation->lead_email,
                    'phone' => $conversation->lead_phone,
                ],
            ]);

        } catch (\Throwable $e) {
            Log::error('ChatController@saveLead error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Erreur serveur. Reessayez.'], 500);
        }
    }

    /**
     * API JSON : liste toutes les conversations pour l'agence
     */
    public function adminConversations(Request $request)
    {
        $secretKey = env('ADMIN_API_KEY', 'veasybility-secret-key-2026');

        if ($request->header('X-Admin-Key') !== $secretKey && $request->query('key') !== $secretKey) {
            return response()->json(['error' => 'Acces non autorise.'], 403);
        }

        try {
            $conversations = ChatConversation::with(['messages' => function ($query) {
                $query->orderBy('created_at', 'asc');
            }])
            ->orderBy('last_message_at', 'desc')
            ->paginate(30);

            return response()->json([
                'total_conversations' => ChatConversation::count(),
                'total_leads'         => ChatConversation::where(function ($q) {
                    $q->whereNotNull('lead_email')->orWhereNotNull('lead_phone');
                })->count(),
                'conversations'       => $conversations,
            ]);

        } catch (\Throwable $e) {
            Log::error('ChatController@adminConversations error: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur base de donnees: ' . $e->getMessage()], 500);
        }
    }
}
