<?php

namespace App\Services;

use App\Models\Notifikasi;
use App\Models\User;

class NotifikasiService
{
    public static function kirim(
        string|User $pengguna,
        string $judul,
        string $pesan,
        string $tipe,
        ?string $referensiId = null
    ): Notifikasi {
        $penggunaId = $pengguna instanceof User ? $pengguna->id : $pengguna;

        return Notifikasi::create([
            'pengguna_id' => $penggunaId,
            'judul' => $judul,
            'pesan' => $pesan,
            'tipe' => $tipe,
            'referensi_id' => $referensiId,
            'sudah_dibaca' => false,
        ]);
    }

    public static function kirimKePimpinan(
        string $judul,
        string $pesan,
        string $tipe,
        ?string $referensiId = null
    ): void {
        $pimpinan = User::whereIn('peran', ['ketufor', 'waketufor'])
            ->where('aktif', true)
            ->get();

        foreach ($pimpinan as $user) {
            self::kirim($user, $judul, $pesan, $tipe, $referensiId);
        }
    }
}
