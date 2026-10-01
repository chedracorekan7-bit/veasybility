<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\ContactFormMail;

class ContactMessageController extends Controller
{
    /**
     * Stocke un nouveau message de contact
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validation avec messages personnalisés
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email:rfc,dns|max:255',
            'subject' => 'nullable|string|max:255',
            'company' => 'required|string|max:255',
            'phone' => 'required|regex:/^[+]?[\d\s\-()]{7,20}$/',
            'services' => 'nullable|array',
            'message' => 'nullable|string|max:5000',
        ], [
            'name.required' => 'Le nom est obligatoire.',
            'name.string' => 'Le nom doit être du texte.',
            'name.max' => 'Le nom ne doit pas dépasser 255 caractères.',
            
            'email.required' => 'L\'email est obligatoire.',
            'email.email' => 'Veuillez entrer une adresse email valide.',
            'email.max' => 'L\'email ne doit pas dépasser 255 caractères.',
            
            'company.required' => 'Le nom de l\'entreprise est obligatoire.',
            'company.string' => 'Le nom de l\'entreprise doit être du texte.',
            'company.max' => 'Le nom de l\'entreprise ne doit pas dépasser 255 caractères.',
            
            'phone.required' => 'Le téléphone est obligatoire.',
            'phone.regex' => 'Format de téléphone invalide. Exemples : +33 6 12 34 56 78 ou 06 12 34 56 78',
            
            'message.max' => 'Le message ne doit pas dépasser 5000 caractères.',
        ]);

        try {
            // Formater le message pour la base de données
            $servicesStr = !empty($validated['services']) 
                ? implode(', ', $validated['services']) 
                : 'Aucun spécifique';
            
            $dbMessage = "Services demandés : " . $servicesStr . "\n"
                       . "Téléphone : " . ($validated['phone'] ?? 'Non renseigné') . "\n"
                       . "Entreprise : " . ($validated['company'] ?? 'Non renseignée') . "\n\n"
                       . "Description du projet :\n"
                       . ($validated['message'] ?? 'Aucune description additionnelle fournie.');

            $subject = $validated['subject'] ?? ('Nouveau Projet - ' . ($validated['company'] ?? $validated['name']));

            // Créer le message en base de données
            $message = ContactMessage::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'subject' => $subject,
                'message' => $dbMessage,
            ]);

            $validated['subject'] = $subject;

            // Envoyer l'email
            try {
                Mail::to('veasybility7@gmail.com')->send(new ContactFormMail($validated));
            } catch (\Exception $e) {
                Log::error('Erreur Mail Contact: ' . $e->getMessage(), [
                    'contact_id' => $message->id,
                    'email' => $validated['email'],
                ]);
                
                // Le message est sauvegardé en BD, on informe l'utilisateur du succès partiel
                return response()->json([
                    'success' => true,
                    'message' => 'Votre message a bien été reçu. Nous vous contacterons bientôt.',
                    'warning' => 'L\'email de confirmation n\'a pas pu être envoyé, mais votre demande est enregistrée.'
                ], 200);
            }

            return response()->json([
                'success' => true,
                'message' => 'Votre message a bien été envoyé. Nous vous répondrons dans les 24h.'
            ], 201);

        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Erreur DB Contact: ' . $e->getMessage(), [
                'sql' => $e->getSql(),
                'bindings' => $e->getBindings(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Une erreur technique empêche l\'enregistrement. Veuillez réessayer dans quelques instants.'
            ], 500);

        } catch (\Exception $e) {
            Log::error('Erreur inattendue Contact: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Une erreur inattendue s\'est produite. Veuillez réessayer plus tard.'
            ], 500);
        }
    }
}
