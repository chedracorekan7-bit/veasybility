<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactFormMail;

class ContactMessageController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'services' => 'nullable|array',
            'message' => 'nullable|string',
        ]);
        
        // Format the message for the database
        $servicesStr = !empty($validated['services']) ? implode(', ', $validated['services']) : 'Aucun spécifique';
        $dbMessage = "Services demandés : " . $servicesStr . "\n"
                   . "Téléphone : " . ($validated['phone'] ?? 'Non renseigné') . "\n"
                   . "Entreprise : " . ($validated['company'] ?? 'Non renseignée') . "\n\n"
                   . "Description du projet :\n"
                   . ($validated['message'] ?? 'Aucune description additionnelle fournie.');

        $subject = $validated['subject'] ?? ('Nouveau Projet - ' . ($validated['company'] ?? $validated['name']));

        try {
            $message = ContactMessage::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'subject' => $subject,
                'message' => $dbMessage,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Erreur DB Contact: ' . $e->getMessage());
            return response()->json([
                'success' => false, 
                'message' => 'Erreur de base de données. Vérifiez vos variables d\'environnement DB sur Render.'
            ], 500);
        }
        
        $validated['subject'] = $subject;
        
        try {
            // Send email to veasybility7@gmail.com
            Mail::to('veasybility7@gmail.com')->send(new ContactFormMail($validated));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Erreur Mail Contact: ' . $e->getMessage());
            return response()->json([
                'success' => false, 
                'message' => 'Erreur d\'envoi d\'email. Vérifiez vos variables d\'environnement MAIL sur Render.'
            ], 500);
        }
        
        return response()->json(['success' => true, 'message' => 'Votre message a bien été envoyé.']);
    }
}
