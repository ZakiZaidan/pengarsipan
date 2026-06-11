<?php

use Illuminate\Support\Facades\Route;

// Semua route web diserahkan ke React (SPA)
Route::get('/{any}', function () {
    $indexPath = public_path('index.html');

    if (!file_exists($indexPath)) {
        return response('Frontend belum di-build atau index.html tidak ditemukan.', 404);
    }

    return response(file_get_contents($indexPath), 200)
        ->header('Content-Type', 'text/html');
})->where('any', '.*');

