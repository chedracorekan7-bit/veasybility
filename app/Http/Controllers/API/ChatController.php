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
     * Nettoie les astérisques et tirets utilisés comme puces dans les réponses
     */
    private function cleanBulletPoints(string $text): string
    {
        // Supprimer les astérisques et tirets au début des lignes
        $text = preg_replace('/^[\s]*[\*\-][\s]+/m', '', $text);
        
        // Supprimer les astérisques et tirets au milieu du texte (entourés d'espaces)
        $text = preg_replace('/[\s]+[\*\-][\s]+/', ' ', $text);
        
        // Supprimer les astérisques et tirets isolés
        $text = preg_replace('/[\s]*[\*\-][\s]*/', '', $text);
        
        // Nettoyer les espaces multiples
        $text = preg_replace('/\s+/', ' ', $text);
        
        // Supprimer les espaces en début et fin de ligne
        $text = preg_replace('/^\s+|\s+$/m', '', $text);
        
        return trim($text);
    }

    /**
     * Détecte et extrait les coordonnées de prospect dans un message
     */
    private function extractLeadDetails(ChatConversation $conversation, string $text): bool
    {
        $updated = false;

        // Détection d'un email
        if (!$conversation->lead_email && preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $text, $emailMatches)) {
            $conversation->lead_email = strtolower($emailMatches[0]);
            $updated = true;
        }

        // Détection d'un numéro de téléphone / WhatsApp (au moins 8 chiffres)
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

            // Envoi de la notification immédiate par email
            $this->notifyLeadCapture($conversation);
        }

        return $updated;
    }

    /**
     * Envoie un email d'alerte à l'agence si un prospect a laissé ses coordonnées
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
            Log::error('Erreur notification email prospect chatbot: ' . $e->getMessage());
        }
    }

    /**
     * Envoi d'un message au chatbot et génération de la réponse IA
     */
    public function ask(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'session_id' => 'nullable|string|max:100',
        ]);

        $userMessage = trim($request->message);
        $sessionId = $request->input('session_id') ?: ('cs_' . Str::random(20));

        // 1. Récupération ou création de la conversation
        $conversation = ChatConversation::firstOrCreate(
            ['session_id' => $sessionId],
            [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status' => 'new',
            ]
        );

        // 2. Sauvegarde du message utilisateur
        $conversation->messages()->create([
            'sender' => 'user',
            'message' => $userMessage,
        ]);

        // 3. Extraction intelligente de coordonnées
        $this->extractLeadDetails($conversation, $userMessage);

        // 4. Construction du contexte avec mémoire des 6 derniers messages
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
- Développement de sites web vitrines modernes et performants
- Landing pages haute conversion
- Applications web et mobiles sur mesure
- Optimisation des performances web, UX et SEO technique
- Motion design, montage vidéo et branding digital complet

MISSION : Aider les marques et entreprises à décupler leur visibilité, leur crédibilité et leurs conversions.
PROMPT;

        $apiKey = config('services.groq.key');

        if (!$apiKey) {
            return response()->json(['reply' => 'Erreur: La clé API Groq n\'est pas configurée.'], 500);
        }

        // Récupérer les 6 derniers messages pour donner la mémoire à l'IA
        $recentMessages = $conversation->messages()
            ->latest('id')
            ->take(6)
            ->get()
            ->reverse();

        $messagesPayload = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach ($recentMessages as $msg) {
            $messagesPayload[] = [
                'role' => $msg->sender === 'user' ? 'user' : 'assistant',
                'content' => $msg->message,
            ];
        }

        $models = ['llama-3.1-8b-instant', 'llama3-8b-8192'];
        $payload = [
            'messages' => $messagesPayload,
            'temperature' => 0.7,
            'max_tokens' => 1024,
        ];

        $cleanedReply = null;

        foreach ($models as $model) {
            try {
                $response = Http::withToken($apiKey)
                    ->timeout(30)
                    ->post('https://api.groq.com/openai/v1/chat/completions', array_merge($payload, ['model' => $model]));

                if ($response->successful()) {
                    $rawReply = $response->json()['choices'][0]['message']['content'];
                    $cleanedReply = $this->cleanBulletPoints($rawReply);
                    break;
                }

                Log::warning("Groq model {$model} failed: " . $response->status() . ' - ' . $response->body());
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                Log::error("Groq connexion impossible ({$model}): " . $e->getMessage());
            }
        }

        if (!$cleanedReply) {
            return response()->json(['reply' => 'Service temporairement indisponible. Réessayez dans un instant.'], 503);
        }

        // 5. Sauvegarde de la réponse du bot
        $conversation->messages()->create([
            'sender' => 'bot',
            'message' => $cleanedReply,
        ]);

        // Mise à jour de la session
        $conversation->increment('messages_count', 2);
        $conversation->last_message_at = now();
        $conversation->save();

        return response()->json([
            'reply' => $cleanedReply,
            'session_id' => $conversation->session_id,
            'lead_captured' => (bool) ($conversation->lead_email || $conversation->lead_phone),
        ]);
    }

    /**
     * Récupère l'historique complet d'une conversation par session_id
     */
    public function history(Request $request)
    {
        $sessionId = $request->query('session_id');

        if (!$sessionId) {
            return response()->json(['messages' => [], 'lead_captured' => false]);
        }

        $conversation = ChatConversation::where('session_id', $sessionId)->first();

        if (!$conversation) {
            return response()->json(['messages' => [], 'lead_captured' => false]);
        }

        $messages = $conversation->messages()
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($m) {
                return [
                    'text' => $m->message,
                    'isBot' => $m->sender === 'bot',
                    'time' => $m->created_at->format('H:i'),
                ];
            });

        return response()->json([
            'messages' => $messages,
            'session_id' => $conversation->session_id,
            'lead_captured' => (bool) ($conversation->lead_email || $conversation->lead_phone),
            'lead_name' => $conversation->lead_name,
            'lead_email' => $conversation->lead_email,
            'lead_phone' => $conversation->lead_phone,
        ]);
    }

    /**
     * Enregistre manuellement les coordonnées d'un prospect
     */
    public function saveLead(Request $request)
    {
        $validated = $request->validate([
            'session_id' => 'required|string',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
        ]);

        $conversation = ChatConversation::firstOrCreate(
            ['session_id' => $validated['session_id']],
            [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status' => 'new',
            ]
        );

        if (!empty($validated['name'])) {
            $conversation->lead_name = $validated['name'];
        }
        if (!empty($validated['email'])) {
            $conversation->lead_email = strtolower($validated['email']);
        }
        if (!empty($validated['phone'])) {
            $conversation->lead_phone = $validated['phone'];
        }

        $conversation->status = 'lead_captured';
        $conversation->save();

        $this->notifyLeadCapture($conversation);

        return response()->json([
            'success' => true,
            'message' => 'Coordonnées enregistrées avec succès.',
            'lead' => [
                'name' => $conversation->lead_name,
                'email' => $conversation->lead_email,
                'phone' => $conversation->lead_phone,
            ]
        ]);
    }

    /**
     * Tableau de bord pour l'agence : liste toutes les conversations et prospects
     */
    public function adminConversations(Request $request)
    {
        $secretKey = env('ADMIN_API_KEY', 'veasybility-secret-key-2026');
        if ($request->header('X-Admin-Key') !== $secretKey && $request->query('key') !== $secretKey) {
            return response()->json(['error' => 'Accès non autorisé.'], 403);
        }

        $conversations = ChatConversation::with(['messages' => function ($query) {
            $query->orderBy('created_at', 'asc');
        }])
        ->orderBy('last_message_at', 'desc')
        ->paginate(30);

        return response()->json([
            'total_conversations' => ChatConversation::count(),
            'total_leads' => ChatConversation::whereNotNull('lead_email')->orWhereNotNull('lead_phone')->count(),
            'conversations' => $conversations,
        ]);
    }
}
