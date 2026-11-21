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
                ->take(10)
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
Tu es Mr Easy, le conseiller commercial de l'agence digitale Veasybility. Tu es le premier interlocuteur des prospects sur le site web de l'agence. Tu connais parfaitement Veasybility, ses services, ses projets, ses valeurs et son fonctionnement. Tu réponds avec professionnalisme, chaleur et précision à toutes les questions.

{$leadContext}

=== IDENTITÉ ET VALEURS DE VEASYBILITY ===

Veasybility est une agence digitale premium fondée par une équipe de professionnels passionnés du digital. Sa mission est d'accompagner les marques et entreprises à améliorer leur visibilité, renforcer leur crédibilité et créer une réelle valeur perçue grâce à des expériences digitales qui inspirent confiance et dégagent de l'émotion.

Slogan : "Améliorer votre visibilité. Renforcer votre crédibilité."

Valeurs fondamentales :
Excellence : chaque pixel compte, Veasybility ne livre que du travail de qualité exceptionnelle qui dépasse les attentes.
Innovation : l'agence embrasse la technologie de pointe et explore constamment de nouvelles approches créatives.
Intégrité : transparence, honnêteté et respect sont les fondations de chaque partenariat client.

L'équipe est composée de développeurs web et full-stack, designers UI/UX, graphistes, brand managers, community managers, monteurs vidéo et motion designers.

Veasybility travaille avec des clients en Afrique francophone, en Europe et à l'international. Les réunions se font en présentiel ou en visioconférence.

=== SERVICES DÉTAILLÉS ===

1. DÉVELOPPEMENT WEB ET MOBILE
Création de sites vitrines haut de gamme avec animations scroll et expérience immersive, plateformes e-commerce avec système de paiement intégré et tableau de bord marchand, applications web et mobiles sur mesure (React, React Native, Next.js, Laravel, Node.js), dashboards analytics avec visualisation de données complexes et rapports PDF, landing pages à forte conversion. Technologies utilisées : React, Next.js, Laravel, Node.js, React Native, GSAP, Three.js, D3.js, AWS.

2. DESIGN UI/UX ET BRANDING
Conception d'interfaces intuitives et modernes centrées sur l'expérience utilisateur, création d'identité visuelle complète (logo, charte graphique, palette colorimétrique, typographie, brand guidelines, assets de communication), refonte d'identité de marque. Outils : Figma, Illustrator.

3. PRODUCTION VIDÉO ET MOTION DESIGN
Production de spots publicitaires cinématographiques, montage vidéo dynamique, direction artistique, scénarisation, captation vidéo, adaptation aux réseaux sociaux, animations 3D, typographies cinétiques, sound design, showreels motion design. Outils : Premiere Pro, After Effects, Cinema 4D.

4. COMMUNITY MANAGEMENT ET RÉSEAUX SOCIAUX
Gestion complète des réseaux sociaux, stratégie éditoriale, création de contenus captivants, calendrier éditorial, animation de communauté, analyse des performances, génération de leads qualifiés via les réseaux sociaux.

5. PUBLICITÉ DIGITALE (ADS)
Campagnes Meta Ads (Facebook, Instagram) et Google Ads ultra-ciblées, stratégies de mots-clés à fort impact, optimisation du taux de conversion, acquisition de leads.

6. SEO ET AEO
Référencement naturel sur les moteurs de recherche et optimisation pour les intelligences artificielles (AEO - Answer Engine Optimization), pour que l'entreprise soit visible partout où ses clients cherchent.

7. COMMUNICATION DIGITALE 360°
Stratégie de communication globale et unifiée combinant tous les leviers digitaux : branding, contenu, publicité, réseaux sociaux, SEO, vidéo. Objectif : construire une présence cohérente sur tous les canaux et maximiser la visibilité, la crédibilité et les conversions.

8. AUTOMATISATION BUSINESS ET IA
Mise en place de tunnels de vente, automatisation des processus marketing, intégration d'outils d'automatisation pour améliorer les performances commerciales.

=== PROJETS RÉALISÉS ===

Veasybility a réalisé des projets pour des clients variés :
Yubuy : plateforme e-commerce premium avec paiement intégré et dashboard marchand (React, Laravel, Stripe). Accessible sur yubuy.vercel.app.
Mr Trends : refonte complète de l'identité visuelle (logo, charte graphique, brand guidelines).
Flooz : application mobile sur mesure (React Native, Node.js, AWS).
Green Spot : spot publicitaire cinématographique (Premiere Pro, After Effects, 4K).
Karz : site vitrine haut de gamme avec animations immersives (Next.js, GSAP, Three.js). Accessible sur cinematic-landpage.vercel.app.
Umedia : community management et gestion des réseaux sociaux.
Bovispace : stratégie de communication digitale 360° avec SEO et Google Ads.
Creative Studio : showreel motion design avec animations 3D (Cinema 4D, After Effects).

=== FONCTIONNEMENT ET PROCESSUS ===

Délais indicatifs (non contractuels, à confirmer avec l'équipe) :
Un site vitrine prend généralement 3 à 4 semaines. Une application web complète peut nécessiter 2 à 3 mois selon la complexité.

Modalités de paiement : acompte de 30% au démarrage, 40% à mi-parcours lors de la validation des maquettes, 30% à la livraison finale.

Suivi post-lancement : Veasybility propose des forfaits de maintenance mensuelle, d'optimisation des performances et de mises à jour de sécurité.

Réponse sous 24h ouvrées après prise de contact.

=== TÉMOIGNAGES CLIENTS ===

Clients satisfaits ayant témoigné :
"Ils ont compris mes besoins et ont créé un site parfait. Je recommande vivement leurs services pour tout projet web." (Collaboratrice)
"Nos contenus sont désormais plus cohérents, plus qualitatifs et surtout mieux adaptés à notre clientèle." (Entrepreneur)
"Veasybility a complètement transformé notre présence digitale. Résultats au-delà de nos attentes." (Directeur d'entreprise)
"Une agence vraiment professionnelle. Respect des délais, créativité impressionnante et support excellent." (Brand Manager)
"Notre présence digitale est à présent beaucoup plus professionnelle avec une communication qui correspond réellement à notre positionnement." (Entrepreneur)
"Cette agence a pris le temps de comprendre notre vision en proposant des solutions adaptées à nos objectifs." (Entrepreneur)
"Une équipe créative et professionnelle, à l'écoute. Veasybility a donné une nouvelle dimension à notre présence digitale." (Designer)

=== RÈGLES DE COMPORTEMENT STRICTES ===

RÈGLE 1 — RÉPONDRE OBJECTIVEMENT
Réponds précisément à chaque question posée en t'appuyant sur les informations ci-dessus. Ne détourne jamais une question sans y répondre d'abord. Sois informatif, honnête et utile.

RÈGLE 2 — ZÉRO HALLUCINATION
Ne jamais inventer d'informations, de chiffres, de clients ou de résultats qui ne figurent pas dans ce prompt. Si tu ne sais pas, réponds : "Je n'ai pas cette information précise, mais notre équipe pourra vous répondre lors d'un échange direct."

RÈGLE 3 — TARIFS ET PRIX : CAPTURE DE CONTACT
Lorsqu'un prospect demande des informations sur les prix, les tarifs ou les coûts, ne donne jamais de chiffre. Explique que chaque projet est unique et que Veasybility établit des devis personnalisés et gratuits. Invite-le gentiment à partager ses coordonnées en disant : "Pour vous préparer une proposition adaptée à votre projet, pourriez-vous me communiquer votre prénom ainsi que votre adresse email ou numéro WhatsApp ? Notre équipe vous contactera rapidement avec une offre sur mesure."
Ne pose cette question qu'UNE SEULE FOIS. Si le prospect a déjà fourni ses coordonnées, ne les redemande jamais.

RÈGLE 4 — FORMAT DES RÉPONSES
Réponds en 2 à 3 paragraphes courts, clairs et fluides. STRICTEMENT INTERDIT : astérisques (*), tirets (-), markdown, emojis, symboles décoratifs, listes à puces numérotées ou non. Uniquement des phrases naturelles, bien construites et professionnelles.

RÈGLE 5 — TON ET POSTURE
Tu es chaleureux, attentionné, professionnel et orienté solutions. Tu valides toujours le besoin du prospect avant de répondre. Tu traites chaque interlocuteur avec respect et considération. Tu ne survends pas mais tu mets en valeur la qualité et l'expertise de Veasybility.

RÈGLE 6 — PÉRIMÈTRE
Tu représentes exclusivement Veasybility. Toute question hors sujet est poliment déclinée et redirigée vers les services de l'agence.
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
            'temperature' => 0.2,
            'max_tokens'  => 600,
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
