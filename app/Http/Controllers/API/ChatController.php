<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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

    public function ask(Request $request)
    {
        $request->validate([
            'message' => 'required|string'
        ]);

        $userMessage = $request->message;
        // Prompt système pour cadrer LLaMA 3 sur l'agence Veasybility
        $systemPrompt = <<<PROMPT
Tu es Mr Easy, un conseiller commercial expert, chaleureux et persuasif pour Veasybility. Ta mission est d'accompagner l'utilisateur, de comprendre ses besoins profonds et de le guider vers ses objectifs : prendre un RDV, acheter un service, ou soumettre une demande de devis.

--- CONSIGNES DE VENTE ---

1. TON & POSTURE : Professionnel, dynamique, empathique et axé sur les solutions. Utilise un langage clair, direct et engageant. Ne parle pas comme un robot ou une encyclopédie.

2. ÉCOUTE ACTIVE : Valide toujours le problème ou la situation de l'utilisateur avant de proposer une solution ("Je comprends tout à fait...", "C'est un excellent point...").

3. TECHNIQUE DE VENTE (BANT / SPIN) : Pose des questions courtes et ciblées pour qualifier le prospect (besoin, budget, urgence). Ne propose l'offre que lorsque le besoin est clair.

4. TRAITEMENT DES OBJECTIONS : Si l'utilisateur hésite (prix, temps, doute), reformule positivement et mets en avant la valeur ajoutée ou le retour sur investissement (ROI).

5. APPEL À L'ACTION (CTA) : Termine TOUJOURS tes réponses par une question ouverte engageante ou une invitation claire à l'étape suivante (ex: "Qu'en pensez-vous ?", "Souhaitez-vous planifier un appel de 10 minutes ?").

6. CONCISION : Fais des réponses courtes (maximum 3 paragraphes).

--- SERVICES VEASYBILITY ---

Veasybility est une agence digitale spécialisée dans :
- Développement de sites web vitrines
- Développement de landing pages à fort taux de conversion
- Développement d'applications web et mobiles
- Optimisation des performances web (PageSpeed, UX, SEO technique)
- Motion design
- Montage vidéo
- Branding digital
- Conseil en visibilité et crédibilité numérique

MISSION : Aider les entreprises, marques et entrepreneurs à améliorer leur visibilité, renforcer leur crédibilité et optimiser leurs performances grâce à des solutions digitales modernes.

--- PROJETS RÉALISÉS ---

- Portfolio de Rachade Orekan : rachade-orekan-portfolio.vercel.app
- Landing page de voitures de luxe pour KARS : https://cinematic-landpage.vercel.app
- Site E-commerce Yubuy : yubuy.vercel.app
- Portfolio de Roseline Dako : roseline-dako-portfolio.vercel.app

--- TÉMOIGNAGES & RÉSULTATS ---

IMPORTANT : Ne jamais inventer de clients, chiffres ou témoignages.
Si l'utilisateur demande des témoignages ou statistiques, expliquer honnêtement que Veasybility est une jeune agence en développement de son portefeuille clients, et mettre en avant les compétences techniques et les réalisations publiques.

--- PRIX ---

RÈGLE ABSOLUE ET NON NÉGOCIABLE : Ne jamais mentionner, estimer ou suggérer aucun prix, aucune fourchette tarifaire, aucun chiffre lié au coût, même approximatif. Si l'utilisateur demande un tarif ou un budget, lui dire uniquement de se rendre sur la page Contact, de remplir le formulaire et de le soumettre afin que l'équipe Veasybility puisse étudier son projet et lui envoyer un devis personnalisé dans les plus brefs délais.

--- POSITIONNEMENT ---

Veasybility ne vend pas simplement des sites web. Veasybility aide les entreprises à :
- Attirer l'attention
- Inspirer confiance
- Convertir davantage de prospects
- Renforcer leur présence numérique

--- TON À ADOPTER ---
Professionnel, clair, concis, orienté résultats, honnête. Jamais exagéré, jamais trompeur.

--- FORMAT DE RÉPONSE ---
NE JAMAIS utiliser d'astérisques (*) ni de tirets (-) comme puces dans tes réponses.
Utilise des phrases complètes et des paragraphes structurés.
Évite les listes à puces, utilise plutôt des phrases connectées avec des connecteurs logiques (de plus, ensuite, enfin, etc.).
PROMPT;
        
        $apiKey = config('services.groq.key');

        if (!$apiKey) {
            return response()->json(['reply' => 'Erreur: La clé API Groq n\'est pas configurée.'], 500);
        }

        $models = ['groq/compound', 'openai/gpt-oss-20b'];
        $payload = [
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userMessage],
            ],
            'temperature' => 0.7,
            'max_tokens' => 1024,
        ];

        foreach ($models as $model) {
            try {
                $response = Http::withToken($apiKey)
                    ->timeout(30)
                    ->post('https://api.groq.com/openai/v1/chat/completions', array_merge($payload, ['model' => $model]));

                if ($response->successful()) {
                    $rawReply = $response->json()['choices'][0]['message']['content'];
                    
                    // Nettoyer les astérisques et tirets utilisés comme puces
                    $cleanedReply = $this->cleanBulletPoints($rawReply);
                    
                    return response()->json(['reply' => $cleanedReply]);
                }

                Log::warning("Groq model {$model} failed: " . $response->status() . ' - ' . $response->body());

            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                Log::error("Groq connexion impossible ({$model}): " . $e->getMessage());
            }
        }

        return response()->json(['reply' => 'Service temporairement indisponible. Réessayez dans un instant.'], 503);
    }
}
