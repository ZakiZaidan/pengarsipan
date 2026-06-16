<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Kirim notifikasi WhatsApp ke user tertentu.
     * Menggunakan Fonnte API (gratis untuk testing).
     * Ganti API_KEY dengan token dari fonnte.com
     */
    public static function kirim(string $nomorWa, string $pesan): bool
    {
        $apiKey = config('services.whatsapp.api_key');

        if (!$apiKey || !$nomorWa) {
            Log::warning('WhatsApp: API key atau nomor WA kosong', [
                'nomor' => $nomorWa,
                'has_key' => !empty($apiKey),
            ]);
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $apiKey,
            ])->post('https://api.fonnte.com/send', [
                'target' => $nomorWa,
                'message' => $pesan,
            ]);

            if ($response->successful()) {
                Log::info('WhatsApp: Pesan terkirim', ['nomor' => $nomorWa]);
                return true;
            }

            Log::error('WhatsApp: Gagal kirim', [
                'nomor' => $nomorWa,
                'response' => $response->body(),
            ]);
            return false;
        } catch (\Exception $e) {
            Log::error('WhatsApp: Exception', [
                'nomor' => $nomorWa,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Kirim notifikasi ke user berdasarkan model User.
     */
    public static function kirimKeUser(User $user, string $pesan): bool
    {
        if (!$user->nomor_wa) {
            return false;
        }

        return self::kirim($user->nomor_wa, $pesan);
    }

    /**
     * Kirim notifikasi ke semua pimpinan (Ketufor & Waketufor).
     */
    public static function kirimKePimpinan(string $pesan): void
    {
        $pimpinan = User::whereIn('peran', ['ketufor', 'waketufor', 'penasehat', 'ketua_harian'])
            ->where('aktif', true)
            ->whereNotNull('nomor_wa')
            ->get();

        foreach ($pimpinan as $user) {
            self::kirim($user->nomor_wa, $pesan);
        }
    }

    /**
     * Kirim notifikasi disposisi ke penerima.
     */
    public static function notifDisposisi(User $penerima, string $dariNama, string $perihal, string $instruksi): bool
    {
        $pesan = "📋 *DISPOSISI BARU*\n\n"
            . "Dari: {$dariNama}\n"
            . "Perihal: {$perihal}\n"
            . "Instruksi: {$instruksi}\n\n"
            . "Silakan cek aplikasi Sistem Arsip untuk tindak lanjut.";

        return self::kirimKeUser($penerima, $pesan);
    }

    /**
     * Kirim notifikasi pengajuan naskah ke pimpinan.
     */
    public static function notifPengajuan(string $dariNama, string $perihal): void
    {
        $pesan = "📄 *NASKAH PERLU VERIFIKASI*\n\n"
            . "Dari: {$dariNama}\n"
            . "Perihal: {$perihal}\n\n"
            . "Silakan cek aplikasi Sistem Arsip untuk verifikasi.";

        self::kirimKePimpinan($pesan);
    }

    /**
     * Kirim notifikasi naskah disetujui/ditolak ke pembuat.
     */
    public static function notifStatusNaskah(User $pembuat, string $perihal, string $status, ?string $catatan = null): bool
    {
        $emoji = $status === 'disetujui' ? '✅' : '❌';
        $pesan = "{$emoji} *NASKAH {$status}*\n\n"
            . "Perihal: {$perihal}\n";

        if ($catatan) {
            $pesan .= "Catatan: {$catatan}\n";
        }

        $pesan .= "\nSilakan cek aplikasi Sistem Arsip.";

        return self::kirimKeUser($pembuat, strtoupper($pesan));
    }
}
