<x-mail::message>
# 🚀 Nouveau Prospect Capturé par le Chatbot IA !

Un visiteur vient d'échanger avec **Mr Easy** sur votre site et a partagé ses coordonnées.

---

### 👤 Informations du Prospect :
* **Nom :** {{ $conversation->lead_name ?? 'Non spécifié' }}
* **Email :** {{ $conversation->lead_email ?? 'Non spécifié' }}
* **Téléphone / WhatsApp :** {{ $conversation->lead_phone ?? 'Non spécifié' }}
* **Date & Heure :** {{ $conversation->last_message_at ? $conversation->last_message_at->timezone('Europe/Paris')->format('d/m/Y à H:i') : now()->format('d/m/Y à H:i') }}
* **Nombre de messages :** {{ $conversation->messages_count }}

---

### 💬 Transcription complète de la conversation :

@foreach($messages as $msg)
@if($msg->sender === 'user')
> **👤 Visiteur ({{ $msg->created_at->format('H:i') }}) :**  
> {{ $msg->message }}
@else
> **🤖 Mr Easy ({{ $msg->created_at->format('H:i') }}) :**  
> {{ $msg->message }}
@endif

---
@endforeach

@if($conversation->lead_email)
<x-mail::button :url="'mailto:' . $conversation->lead_email . '?subject=Suite%20%C3%A0%20votre%20%C3%A9change%20avec%20Veasybility'">
📧 Répondre au prospect par Email
</x-mail::button>
@endif

@if($conversation->lead_phone)
<x-mail::button :url="'https://wa.me/' . preg_replace('/[^0-9]/', '', $conversation->lead_phone)">
💬 Contacter sur WhatsApp
</x-mail::button>
@endif

Ce prospect attend un retour réactif pour maximiser vos chances de conversion !

Cordialement,  
**Système IA Veasybility**
</x-mail::message>
