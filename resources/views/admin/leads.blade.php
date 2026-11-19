<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Veasybility CRM - Suivi des Prospects</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background: #0a0a0c; color: #f1f5f9; }
        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; }
        .badge-lead { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
        .badge-new { background: rgba(99,102,241,0.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); }
        .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 50; align-items: center; justify-content: center; padding: 1rem; }
        .modal-overlay.active { display: flex; }
        .btn-primary { background: #10b981; color: #000; font-weight: 600; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 12px; transition: background 0.2s; }
        .btn-primary:hover { background: #34d399; }
        .btn-secondary { background: rgba(255,255,255,0.08); color: #e2e8f0; font-weight: 500; padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: 12px; transition: background 0.2s; }
        .btn-secondary:hover { background: rgba(255,255,255,0.15); }
        .msg-user { background: #10b981; color: #000; border-radius: 16px 16px 4px 16px; }
        .msg-bot { background: rgba(255,255,255,0.08); color: #e2e8f0; border-radius: 16px 16px 16px 4px; }
    </style>
</head>
<body>

<div style="max-width:1200px; margin:0 auto; padding:32px 16px;">

    {{-- HEADER --}}
    <header style="display:flex; align-items:center; justify-content:space-between; padding-bottom:24px; border-bottom:1px solid rgba(255,255,255,0.08); margin-bottom:32px; flex-wrap:wrap; gap:16px;">
        <div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
                <span style="width:10px; height:10px; border-radius:50%; background:#10b981; display:inline-block; animation: pulse 2s infinite;"></span>
                <h1 style="font-size:22px; font-weight:800; margin:0;">Veasybility <span style="color:#34d399;">Leads CRM</span></h1>
            </div>
            <p style="color:#94a3b8; font-size:13px; margin:0;">Historique des conversations et qualification des prospects via Mr Easy.</p>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
            <span style="font-size:11px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:6px 12px; border-radius:20px; color:#94a3b8;">En direct PostgreSQL</span>
            <a href="{{ request()->fullUrl() }}" class="btn-primary">Actualiser</a>
        </div>
    </header>

    {{-- ERREUR DB --}}
    @if(!empty($dbError))
    <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:12px; padding:20px; margin-bottom:24px; display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap;">
        <div style="flex:1;">
            <h3 style="color:#f87171; font-weight:600; font-size:14px; margin:0 0 6px;">Erreur base de donnees</h3>
            <p style="color:#94a3b8; font-size:12px; margin:0 0 8px;">Les tables du chatbot ne sont pas encore creees sur Render, ou la connexion a echoue.</p>
            <code style="display:block; background:rgba(0,0,0,0.4); padding:10px; border-radius:6px; font-size:11px; color:#fca5a5; overflow-x:auto; white-space:pre-wrap; word-break:break-all;">{{ $dbError }}</code>
        </div>
        <a href="/admin/migrate?key={{ $secretKey ?? 'veasybility-secret-key-2026' }}" class="btn-primary" style="white-space:nowrap;">
            Lancer la migration
        </a>
    </div>
    @endif

    {{-- KPI --}}
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:32px;">
        <div class="card" style="padding:20px;">
            <p style="font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.05em; margin:0 0 8px;">Prospects qualifies</p>
            <p style="font-size:32px; font-weight:800; color:#34d399; margin:0 0 4px;">{{ $totalLeads ?? 0 }}</p>
            <p style="font-size:11px; color:#64748b; margin:0;">Avec email ou telephone</p>
        </div>
        <div class="card" style="padding:20px;">
            <p style="font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.05em; margin:0 0 8px;">Conversations totales</p>
            <p style="font-size:32px; font-weight:800; color:#818cf8; margin:0 0 4px;">{{ $totalConversations ?? 0 }}</p>
            <p style="font-size:11px; color:#64748b; margin:0;">Depuis le lancement</p>
        </div>
        <div class="card" style="padding:20px;">
            <p style="font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.05em; margin:0 0 8px;">Messages echanges</p>
            <p style="font-size:32px; font-weight:800; color:#f59e0b; margin:0 0 4px;">{{ $totalMessages ?? 0 }}</p>
            <p style="font-size:11px; color:#64748b; margin:0;">Total chatbot</p>
        </div>
    </div>

    {{-- LISTE DES CONVERSATIONS --}}
    @if(empty($dbError))
        @if($conversations->isEmpty())
        <div class="card" style="padding:48px; text-align:center;">
            <p style="font-size:40px; margin:0 0 16px;">&#128172;</p>
            <h3 style="color:#94a3b8; font-weight:600; margin:0 0 8px;">Aucune conversation pour le moment</h3>
            <p style="color:#475569; font-size:13px; margin:0;">Les conversations apparaitront ici des que des visiteurs interagiront avec le chatbot.</p>
        </div>
        @else
        <div style="display:flex; flex-direction:column; gap:12px;">
            @foreach($conversations as $conv)
            <div class="card" style="padding:20px;">
                <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap;">

                    {{-- INFOS CONVERSATION --}}
                    <div style="flex:1; min-width:0;">
                        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:8px;">
                            {{-- Badge statut --}}
                            @if($conv->lead_email || $conv->lead_phone)
                                <span class="badge-lead" style="font-size:10px; font-weight:600; padding:3px 10px; border-radius:20px;">LEAD</span>
                            @else
                                <span class="badge-new" style="font-size:10px; font-weight:600; padding:3px 10px; border-radius:20px;">NOUVEAU</span>
                            @endif

                            {{-- ID session --}}
                            <span style="font-family:monospace; font-size:11px; color:#64748b;">{{ $conv->session_id }}</span>

                            {{-- Date --}}
                            <span style="font-size:11px; color:#64748b;">
                                {{ $conv->last_message_at ? $conv->last_message_at->format('d/m/Y H:i') : $conv->created_at->format('d/m/Y H:i') }}
                            </span>
                        </div>

                        {{-- Coordonnees --}}
                        <div style="display:flex; gap:16px; flex-wrap:wrap;">
                            @if($conv->lead_name)
                                <span style="font-size:12px; color:#e2e8f0; font-weight:500;">{{ $conv->lead_name }}</span>
                            @endif
                            @if($conv->lead_email)
                                <a href="mailto:{{ $conv->lead_email }}" style="font-size:12px; color:#34d399; text-decoration:none;">{{ $conv->lead_email }}</a>
                            @endif
                            @if($conv->lead_phone)
                                <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $conv->lead_phone) }}" target="_blank" style="font-size:12px; color:#60a5fa; text-decoration:none;">{{ $conv->lead_phone }}</a>
                            @endif
                            @if(!$conv->lead_name && !$conv->lead_email && !$conv->lead_phone)
                                <span style="font-size:12px; color:#475569;">Visiteur anonyme</span>
                            @endif
                        </div>

                        {{-- Stats --}}
                        <div style="margin-top:8px; font-size:11px; color:#475569;">
                            {{ $conv->messages->count() }} message(s) &bull;
                            IP: {{ $conv->ip_address ?? 'inconnue' }}
                        </div>
                    </div>

                    {{-- ACTIONS --}}
                    <div style="display:flex; gap:8px; align-items:center;">
                        <button onclick="openModal('modal-{{ $conv->id }}')" class="btn-secondary">
                            Voir ({{ $conv->messages->count() }})
                        </button>
                        @if($conv->lead_email)
                            <a href="mailto:{{ $conv->lead_email }}?subject=Suite a votre echange avec Veasybility" class="btn-primary">Repondre</a>
                        @endif
                    </div>

                </div>
            </div>

            {{-- MODALE TRANSCRIPTION --}}
            <div id="modal-{{ $conv->id }}" class="modal-overlay" onclick="if(event.target===this)closeModal('modal-{{ $conv->id }}')">
                <div style="background:#111115; border:1px solid rgba(255,255,255,0.1); border-radius:16px; max-width:640px; width:100%; max-height:85vh; display:flex; flex-direction:column; overflow:hidden;">

                    <div style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h3 style="font-weight:700; font-size:15px; margin:0 0 2px;">Conversation #{{ $conv->id }}</h3>
                            <p style="font-size:11px; color:#64748b; margin:0;">
                                {{ $conv->lead_name ?? 'Visiteur anonyme' }}
                                @if($conv->lead_email) &bull; {{ $conv->lead_email }} @endif
                                @if($conv->lead_phone) &bull; {{ $conv->lead_phone }} @endif
                            </p>
                        </div>
                        <button onclick="closeModal('modal-{{ $conv->id }}')" style="color:#94a3b8; background:none; border:none; cursor:pointer; font-size:20px; line-height:1; padding:4px;">&#10005;</button>
                    </div>

                    <div style="padding:16px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:12px;">
                        @forelse($conv->messages as $m)
                        <div style="display:flex; {{ $m->sender === 'user' ? 'justify-content:flex-end' : 'justify-content:flex-start' }}">
                            <div class="{{ $m->sender === 'user' ? 'msg-user' : 'msg-bot' }}" style="max-width:85%; padding:10px 14px; font-size:12px; line-height:1.6;">
                                <div style="font-size:10px; opacity:0.7; margin-bottom:4px;">
                                    {{ $m->sender === 'user' ? 'Visiteur' : 'Mr Easy' }} &bull; {{ $m->created_at->format('H:i') }}
                                </div>
                                <div style="white-space:pre-wrap;">{{ $m->message }}</div>
                            </div>
                        </div>
                        @empty
                        <p style="color:#475569; text-align:center; font-size:13px;">Aucun message dans cette conversation.</p>
                        @endforelse
                    </div>

                    <div style="padding:12px 16px; border-top:1px solid rgba(255,255,255,0.08); display:flex; justify-content:flex-end; gap:8px;">
                        <button onclick="closeModal('modal-{{ $conv->id }}')" class="btn-secondary">Fermer</button>
                        @if($conv->lead_email)
                            <a href="mailto:{{ $conv->lead_email }}" class="btn-primary">Contacter par email</a>
                        @endif
                    </div>

                </div>
            </div>
            @endforeach
        </div>
        @endif
    @endif

</div>

<style>
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}
</style>

<script>
function openModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.remove('active'); document.body.style.overflow = ''; }
}
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(function(el) {
            el.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
});
</script>

</body>
</html>
