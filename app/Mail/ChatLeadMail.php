<?php

namespace App\Mail;

use App\Models\ChatConversation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ChatLeadMail extends Mailable
{
    use Queueable, SerializesModels;

    public ChatConversation $conversation;
    public $messages;

    /**
     * Create a new message instance.
     */
    public function __construct(ChatConversation $conversation)
    {
        $this->conversation = $conversation;
        // Retrieve ordered messages for the transcript
        $this->messages = $conversation->messages()->orderBy('created_at', 'asc')->get();
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $leadIdentifier = $this->conversation->lead_name 
            ?: ($this->conversation->lead_email ?: ($this->conversation->lead_phone ?: 'Nouveau Prospect'));

        return new Envelope(
            subject: "🔥 [Nouveau Prospect Chatbot] {$leadIdentifier} a discuté avec Mr Easy",
            replyTo: $this->conversation->lead_email ? [$this->conversation->lead_email] : [],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.chat-lead',
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
