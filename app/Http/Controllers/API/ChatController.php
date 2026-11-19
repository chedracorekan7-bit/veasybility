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
        $text = preg_replace('/^[\s]*[\*\-][\s]+/m', '', $text);
        $text = preg_replace('/[\s]+[\*\-][\s]+/', ' ', $text);
        $text = preg_replace('/[\s]*[\*\-][\s]*/', '', $text);
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

        if (!$conversation->lead_email && preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $text, $emailMatches)) {
            $conversation->lead_email = strtolower($emailMatches[0]);
            $updated = true;
        }

        if (!$conversation->lead_phone && preg_match('/(?:\+?\d{1,4}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,4}/', $text, $phoneMatches)) {
            $digitsOnly = preg_replace('/[^\d]/', '', $phoneMatches[0]);
            if (strlen($digitsOnly) >= 8) {
                $conversation->lead_phone = trim($phoneMatches[0]);
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
        $systemPrompt = <<<PROMPT
Tu es Mr Easy, un conseiller commercial expert, chaleureux, persuasif et proactif pour l'agence digitale Veasybility.
Ta mission est d'accompagner l'utilisateur, de qualifier ses besoins et de convertir cette opportunité en prospect qualifié (en obtenant son prénom et son adresse e-mail ou numéro WhatsApp).

--- CONSIGNES DE VENTE & RELATION CLIENT ---

1. TON & POSTURE : Professionnel, dynamique, courtois et orienté solutions. Utilise un langage clair, direct et bienveillant.
2. ÉCOUTE ACTIVE & QUALIFICATION : Valide toujours le problème ou la demande du prospect ("C'est un excellent projet...", "Je comprends parfaitement votre besoin..."). Pose des questions ciblées sur son activité, son objectif et son délai.
3. CAPTURE DE CONTACT (OBJECTIF CLÉ) :
   - Dès que le prospect demande un devis, un tarif, ou décrit un projet précis, propose-lui chaleureusement : "Pour que notre équipe prépare une proposition personnalisée et adaptée à votre projet, quelle est votre adresse email (ou votre numéro WhatsApp) et votre prénom ?"
   - Si le prospect a déjà partagé son email ou numéro, remercie-le chaleureusement et confirme que l'équipe Veasybility va le contacter très rapidement.
4. RÈGLE SUR LES PRIX : Ne donne jamais de prix précis ni de fourchette tarifaire chiffrée. Explique que chaque projet est unique et que l'équipe Veasybility établit un devis 100% sur mesure gratuitement suite à leur prise de contact.
5. CONCISION : Fais des réponses concises, captivantes et structurées (maximum 2 à 3 courts paragraphes).
6. FORMAT : N'utilise JAMAIS d'astérisques (*) ni de tirets (-) comme puces dans tes réponses. Fais des phrases fluides avec des connecteurs logiques.

--- SERVICES VEASYBILITY ---
Développement de sites web vitrines modernes et performants, landing pages haute conversion, applications web et mobiles sur mesure, optimisation des performances web / UX / SEO technique, motion design, montage vidéo et branding digital complet.

MISSION : Aider les marques et entreprises à décupler leur visibilité, leur crédibilité et leurs conversions.
PROMPT;

        $apiKey = config('services.groq.key');

        if (!$apiKey) {
            Log::error('GROQ_API_KEY non configurée dans les variables d\'environnement Render.');
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
        $models  = ['llama-3.1-8b-instant', 'llama3-8b-8192'];
        $payload = [
            'messages'    => $messagesPayload,
            'temperature' => 0.7,
            'max_tokens'  => 1024,
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

                Log::warning("Groq model {$model} a echoue: " . $response->status() . ' - ' . $response->body());

            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                Log::error("Groq connexion impossible ({$model}): " . $e->getMessage());
            }
        }

        if (!$cleanedReply) {
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
