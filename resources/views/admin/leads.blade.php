<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Veasybility CRM — Suivi des Prospects Chatbot</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: { sans: ['"Plus Jakarta Sans"', 'sans-serif'] },
                    colors: {
                        brand: { 500: '#10b981', 600: '#059669' }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-[#0a0a0c] text-slate-100 min-h-screen font-sans antialiased selection:bg-emerald-500 selection:text-black">

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- HEADER -->
        <header class="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-white/10 gap-4">
            <div>
                <div class="flex items-center gap-3">
                    <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h1 class="text-2xl font-bold tracking-tight">Veasybility <span class="text-emerald-400">Leads CRM</span></h1>
                </div>
                <p class="text-sm text-slate-400 mt-1">Historique des conversations et qualification des prospects via Mr Easy.</p>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-slate-300">
                    🟢 En direct PostgreSQL
                </span>
                <a href="{{ request()->fullUrl() }}" class="text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Actualiser
                </a>
            </div>
        </header>

        <!-- KPI STATS -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 my-8">
            <div class="bg-white/[0.03] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
                <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Prospects Qualifiés</p>
                <p class="text-3xl font-extrabold text-emerald-400 mt-2">{{ $totalLeads }}</p>
                <p class="text-xs text-slate-500 mt-1">Avec email ou téléphone</p>
            </div>

            <div class="bg-white/[0.03] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Conversations</p>
                <p class="text-3xl font-extrabold text-blue-400 mt-2">{{ $totalConversations }}</p>
                <p class="text-xs text-slate-500 mt-1">Sessions visiteurs enregistrées</p>
            </div>

            <div class="bg-white/[0.03] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
                <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Messages Échangés</p>
                <p class="text-3xl font-extrabold text-purple-400 mt-2">{{ $totalMessages }}</p>
                <p class="text-xs text-slate-500 mt-1">Questions & réponses IA</p>
            </div>
        </div>

        <!-- CONVERSATIONS LIST -->
        <div class="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div class="p-5 border-b border-white/10 flex justify-between items-center bg-white/[0.01]">
                <h2 class="text-base font-semibold text-white">Dernières discussions ({{ count($conversations) }})</h2>
                <span class="text-xs text-slate-400">Classées par interaction récente</span>
            </div>

            @if(count($conversations) === 0)
                <div class="py-16 text-center text-slate-500">
                    <p class="text-base font-medium">Aucune conversation enregistrée pour le moment.</p>
                    <p class="text-xs text-slate-600 mt-1">Dès qu'un visiteur discute avec Mr Easy, sa session apparaîtra ici en temps réel.</p>
                </div>
            @else
                <div class="divide-y divide-white/5">
                    @foreach($conversations as $conv)
                    <div class="p-5 hover:bg-white/[0.02] transition-colors" id="conv-{{ $conv->id }}">
                        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            
                            <!-- LEAD IDENTIFICATION -->
                            <div class="space-y-1.5 flex-1">
                                <div class="flex items-center gap-2.5 flex-wrap">
                                    @if($conv->lead_email || $conv->lead_phone)
                                        <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                            🔥 Prospect Qualifié
                                        </span>
                                    @else
                                        <span class="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-white/10">
                                            💬 Visiteur anonyme
                                        </span>
                                    @endif

                                    <span class="text-xs text-slate-500">
                                        🕒 {{ $conv->last_message_at ? $conv->last_message_at->timezone('Europe/Paris')->format('d/m/Y à H:i') : $conv->created_at->format('d/m/Y à H:i') }}
                                    </span>
                                </div>

                                <div class="text-base font-semibold text-white flex items-center gap-3">
                                    <span>{{ $conv->lead_name ?? 'Visiteur' }}</span>
                                    @if($conv->lead_email)
                                        <a href="mailto:{{ $conv->lead_email }}" class="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-normal">
                                            ✉️ {{ $conv->lead_email }}
                                        </a>
                                    @endif
                                    @if($conv->lead_phone)
                                        <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $conv->lead_phone) }}" target="_blank" class="text-xs text-green-400 hover:underline flex items-center gap-1 font-normal">
                                            📱 {{ $conv->lead_phone }}
                                        </a>
                                    @endif
                                </div>

                                <!-- DERNIER MESSAGE EXTRAIT -->
                                @php
                                    $lastMsg = $conv->messages->last();
                                @endphp
                                @if($lastMsg)
                                    <p class="text-xs text-slate-400 line-clamp-1 italic">
                                        <strong class="{{ $lastMsg->sender === 'user' ? 'text-slate-300' : 'text-emerald-400' }}">{{ $lastMsg->sender === 'user' ? 'Visiteur' : 'Mr Easy' }}:</strong> {{ Str::limit($lastMsg->message, 120) }}
                                    </p>
                                @endif
                            </div>

                            <!-- ACTIONS -->
                            <div class="flex items-center gap-2 self-start md:self-center">
                                <button onclick="toggleModal('modal-{{ $conv->id }}')" class="text-xs bg-white/10 hover:bg-white/20 text-white font-medium px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5">
                                    <span>Voir conversation ({{ $conv->messages->count() }})</span>
                                </button>
                                @if($conv->lead_email)
                                    <a href="mailto:{{ $conv->lead_email }}?subject=Suite%20%C3%A0%20votre%20%C3%A9change%20avec%20Veasybility" class="text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-3 py-2 rounded-lg transition-all">
                                        Répondre
                                    </a>
                                @endif
                            </div>
                        </div>

                        <!-- MODALE TRANSCRIPTION -->
                        <div id="modal-{{ $conv->id }}" class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
                            <div class="bg-[#121217] border border-white/15 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                                
                                <div class="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                                    <div>
                                        <h3 class="font-bold text-white text-base">Conversation #{{ $conv->id }}</h3>
                                        <p class="text-xs text-slate-400">
                                            {{ $conv->lead_name ?? 'Visiteur' }} 
                                            {{ $conv->lead_email ? '• ' . $conv->lead_email : '' }} 
                                            {{ $conv->lead_phone ? '• ' . $conv->lead_phone : '' }}
                                        </p>
                                    </div>
                                    <button onclick="toggleModal('modal-{{ $conv->id }}')" class="text-slate-400 hover:text-white p-1">
                                        ✕
                                    </button>
                                </div>

                                <div class="p-4 overflow-y-auto space-y-3.5 flex-1 bg-black/20">
                                    @foreach($conv->messages as $m)
                                        <div class="flex {{ $m->sender === 'user' ? 'justify-end' : 'justify-start' }}">
                                            <div class="max-w-[85%] rounded-2xl p-3.5 text-xs {{ $m->sender === 'user' ? 'bg-emerald-500 text-black font-medium rounded-tr-none' : 'bg-white/10 text-slate-200 rounded-tl-none' }}">
                                                <div class="text-[10px] opacity-70 mb-1 {{ $m->sender === 'user' ? 'text-black' : 'text-emerald-400' }}">
                                                    {{ $m->sender === 'user' ? '👤 Visiteur' : '🤖 Mr Easy' }} • {{ $m->created_at->format('H:i') }}
                                                </div>
                                                <div class="whitespace-pre-line leading-relaxed">{{ $m->message }}</div>
                                            </div>
                                        </div>
                                    @endforeach
                                </div>

                                <div class="p-3 border-t border-white/10 flex justify-end gap-2 bg-white/[0.02]">
                                    <button onclick="toggleModal('modal-{{ $conv->id }}')" class="px-4 py-1.5 text-xs rounded-lg text-slate-300 hover:bg-white/5">Fermer</button>
                                    @if($conv->lead_email)
                                        <a href="mailto:{{ $conv->lead_email }}" class="px-4 py-1.5 text-xs rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400">
                                            Contacter par email
                                        </a>
                                    @endif
                                </div>
                            </div>
                        </div>

                    </div>
                    @endforeach
                </div>
            @endif
        </div>

    </div>

    <script>
        function toggleModal(id) {
            const el = document.getElementById(id);
            if (el) {
                el.classList.toggle('hidden');
            }
        }
    </script>
</body>
</html>
