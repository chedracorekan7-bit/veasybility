<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatConversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'lead_name',
        'lead_email',
        'lead_phone',
        'status',
        'lead_notified',
        'ip_address',
        'user_agent',
        'messages_count',
        'last_message_at',
    ];

    protected $casts = [
        'lead_notified' => 'boolean',
        'messages_count' => 'integer',
        'last_message_at' => 'datetime',
    ];

    public function messages()
    {
        return $this->hasMany(ChatMessage::class)->orderBy('created_at', 'asc');
    }

    public function scopeWithLead($query)
    {
        return $query->whereNotNull('lead_email')->orWhereNotNull('lead_phone');
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('last_message_at', 'desc');
    }
}
