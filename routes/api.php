<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ProjectController;
use App\Http\Controllers\API\ContactMessageController;
use App\Http\Controllers\API\ChatController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{slug}', [ProjectController::class, 'show']);
Route::post('/contact', [ContactMessageController::class, 'store']);

// Routes Chatbot & Prospects
Route::post('/chat', [ChatController::class, 'ask']);
Route::get('/chat/history', [ChatController::class, 'history']);
Route::post('/chat/lead', [ChatController::class, 'saveLead']);
Route::get('/admin/conversations', [ChatController::class, 'adminConversations']);

// Route de diagnostic temporaire
Route::get('/debug-env', function () {
    $key = config('services.groq.key');
    return response()->json([
        'groq_key_set'    => !empty($key),
        'groq_key_prefix' => $key ? substr($key, 0, 8) . '...' : null,
        'app_env'         => config('app.env'),
        'app_key_set'     => !empty(config('app.key')),
    ]);
});
