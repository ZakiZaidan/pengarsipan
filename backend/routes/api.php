<?php

use App\Http\Controllers\ArsipController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DisposisiController;
use App\Http\Controllers\EksporPdfController;
use App\Http\Controllers\NaskahController;
use App\Http\Controllers\NotifikasiController;
use App\Http\Controllers\PengaturanController;
use App\Http\Controllers\PenggunaController;
use App\Http\Controllers\TemplateNaskahController;
use Illuminate\Support\Facades\Route;

// --- Public Routes ---
Route::post('/login', [LoginController::class, 'login']);

// --- Protected Routes ---
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::get('/user', [LoginController::class, 'user']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Naskah
    Route::apiResource('naskah', NaskahController::class);
    Route::post('/naskah/{id}/ajukan', [NaskahController::class, 'ajukan']);
    Route::post('/naskah/{id}/setujui', [NaskahController::class, 'setujui']);
    Route::post('/naskah/{id}/tolak', [NaskahController::class, 'tolak']);
    Route::post('/naskah/{id}/tandatangan', [NaskahController::class, 'tandatangan']);
    Route::post('/naskah/{id}/kirim', [NaskahController::class, 'kirim']);
    Route::post('/naskah/{id}/arsipkan', [NaskahController::class, 'arsipkan']);
    Route::get('/naskah/{id}/download-lampiran', [NaskahController::class, 'downloadLampiran']);

    // Disposisi
    Route::apiResource('disposisi', DisposisiController::class)->only(['index', 'store', 'show']);
    Route::put('/disposisi/{id}/baca', [DisposisiController::class, 'baca']);
    Route::put('/disposisi/{id}/tindaklanjuti', [DisposisiController::class, 'tindaklanjuti']);

    // Arsip
    Route::apiResource('arsip', ArsipController::class);
    Route::put('/arsip/{id}/pindahkan', [ArsipController::class, 'pindahkan']);

    // Ekspor PDF
    Route::get('/ekspor-pdf', [EksporPdfController::class, 'index']);
    Route::post('/naskah/{id}/ekspor-pdf', [EksporPdfController::class, 'ekspor']);
    Route::get('/ekspor-pdf/{id}/download', [EksporPdfController::class, 'download']);

    // Notifikasi
    Route::get('/notifikasi', [NotifikasiController::class, 'index']);
    Route::get('/notifikasi/belum-dibaca', [NotifikasiController::class, 'belumDibaca']);
    Route::put('/notifikasi/{id}/baca', [NotifikasiController::class, 'baca']);
    Route::put('/notifikasi/baca-semua', [NotifikasiController::class, 'bacaSemua']);

    // Pengguna & Profil
    Route::apiResource('pengguna', PenggunaController::class)->only(['index', 'store', 'show', 'update']);
    Route::get('/pengguna-list', [PenggunaController::class, 'listSemua']);
    Route::post('/profil/upload-ttd', [\App\Http\Controllers\ProfilController::class, 'uploadTtd']);

    // Template Naskah
    Route::apiResource('template-naskah', TemplateNaskahController::class)->only(['index', 'store', 'update', 'destroy']);

    // Pengaturan
    Route::get('/pengaturan', [PengaturanController::class, 'index']);
    Route::put('/pengaturan', [PengaturanController::class, 'update']);
    Route::post('/pengaturan/upload-kop', [PengaturanController::class, 'uploadKop']);
});
