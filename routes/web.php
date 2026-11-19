<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/admin/leads', function (\Illuminate\Http\Request $request) {
    $secretKey = env('ADMIN_API_KEY', 'veasybility-secret-key-2026');
    if ($request->query('key') !== $secretKey) {
        abort(403, 'Accès non autorisé. Clé d\'administration invalide.');
    }

    $conversations = \App\Models\ChatConversation::with(['messages' => function ($query) {
        $query->orderBy('created_at', 'asc');
    }])
    ->orderBy('last_message_at', 'desc')
    ->get();

    $totalConversations = \App\Models\ChatConversation::count();
    $totalLeads = \App\Models\ChatConversation::where(function($q) {
        $q->whereNotNull('lead_email')->orWhereNotNull('lead_phone');
    })->count();
    $totalMessages = \App\Models\ChatMessage::count();

    return view('admin.leads', compact('conversations', 'totalConversations', 'totalLeads', 'totalMessages'));
});
