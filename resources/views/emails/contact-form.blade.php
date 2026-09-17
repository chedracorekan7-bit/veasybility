<x-mail::message>
# Nouveau Message de Contact

Vous avez reçu un nouveau message depuis le formulaire de contact.

**Nom :** {{ $contactData['name'] }}
**Entreprise :** {{ $contactData['company'] ?? 'Non renseignée' }}
**Email :** {{ $contactData['email'] }}
**Téléphone :** {{ $contactData['phone'] ?? 'Non renseigné' }}
**Sujet :** {{ $contactData['subject'] ?? 'Aucun' }}

@if(!empty($contactData['services']))
**Services intéressés :**
@foreach($contactData['services'] as $service)
- {{ $service }}
@endforeach
@endif

**Message :**
{{ $contactData['message'] ?? 'Aucun message.' }}

<x-mail::button :url="'mailto:' . $contactData['email']">
Répondre à {{ $contactData['name'] }}
</x-mail::button>

Merci,<br>
{{ config('app.name') }}
</x-mail::message>
