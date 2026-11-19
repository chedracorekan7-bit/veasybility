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

    $dbError = null;
    $conversations = collect([]);
    $totalConversations = 0;
    $totalLeads = 0;
    $totalMessages = 0;

    try {
        // Auto-migrate si les tables n'existent pas encore
        if (!\Illuminate\Support\Facades\Schema::hasTable('chat_conversations')) {
            \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
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
    } catch (\Throwable $e) {
        $dbError = $e->getMessage();
        \Illuminate\Support\Facades\Log::error('Admin Leads DB Error: ' . $dbError);
    }

    return view('admin.leads', compact('conversations', 'totalConversations', 'totalLeads', 'totalMessages', 'dbError', 'secretKey'));
});

Route::get('/admin/migrate', function (\Illuminate\Http\Request $request) {
    $secretKey = env('ADMIN_API_KEY', 'veasybility-secret-key-2026');
    if ($request->query('key') !== $secretKey) {
        abort(403, 'Accès non autorisé. Clé d\'administration invalide.');
    }

    try {
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        $migrateOutput = \Illuminate\Support\Facades\Artisan::output();

        \Illuminate\Support\Facades\Artisan::call('config:clear');
        \Illuminate\Support\Facades\Artisan::call('view:clear');

        return response('<!DOCTYPE html><html><body style="background:#0a0a0c;color:#fff;font-family:sans-serif;padding:40px;line-height:1.6;">'
            . '<h2 style="color:#10b981;">✅ Migrations exécutées avec succès !</h2>'
            . '<pre style="background:#18181b;padding:15px;border-radius:8px;border:1px solid #333;color:#a1a1aa;overflow-x:auto;">' . htmlspecialchars($migrateOutput) . '</pre>'
            . '<p><a href="/admin/leads?key=' . $secretKey . '" style="display:inline-block;background:#10b981;color:#000;font-weight:bold;padding:10px 20px;border-radius:8px;text-decoration:none;">➔ Retourner au CRM Leads</a></p>'
            . '</body></html>');
    } catch (\Throwable $e) {
        return response('<!DOCTYPE html><html><body style="background:#0a0a0c;color:#fff;font-family:sans-serif;padding:40px;line-height:1.6;">'
            . '<h2 style="color:#ef4444;">❌ Erreur lors de la migration :</h2>'
            . '<pre style="background:#18181b;padding:15px;border-radius:8px;border:1px solid #ef4444;color:#fca5a5;overflow-x:auto;">' . htmlspecialchars($e->getMessage()) . '</pre>'
            . '<p style="color:#a1a1aa;">Vérifiez vos variables de connexion de base de données (DB_HOST, DB_PASSWORD, etc.) dans votre tableau de bord Render.</p>'
            . '</body></html>', 500);
    }
});
