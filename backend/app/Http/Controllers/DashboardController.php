<?php

namespace App\Http\Controllers;

use App\Models\Arsip;
use App\Models\Disposisi;
use App\Models\LogAktivitas;
use App\Models\Naskah;
use App\Models\Notifikasi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $totalNaskah = Naskah::count();
        $naskahDraft = Naskah::where('status', 'draft')->count();
        $naskahMenunggu = Naskah::where('status', 'menunggu_verifikasi')->count();
        $naskahMasukBaru = Naskah::where('jenis', 'masuk')
            ->whereDate('created_at', today())
            ->count();

        $totalArsip = Arsip::count();
        $arsipAktif = Arsip::where('status_retensi', 'aktif')->count();

        $disposisiBelumDibaca = Disposisi::where('ke_pengguna', $user->id)
            ->where('status', 'belum_dibaca')
            ->count();

        $notifikasiBelumDibaca = Notifikasi::where('pengguna_id', $user->id)
            ->where('sudah_dibaca', false)
            ->count();

        // Aktivitas terkini
        $aktivitasTerkini = LogAktivitas::with('pengguna:id,nama_lengkap,peran')
            ->orderBy('terjadi_pada', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($log) => [
                'id' => $log->id,
                'aksi' => $log->aksi,
                'objek_tipe' => $log->objek_tipe,
                'pengguna' => $log->pengguna?->nama_lengkap ?? 'Sistem',
                'terjadi_pada' => $log->terjadi_pada,
            ]);

        // Naskah terbaru
        $naskahTerbaru = Naskah::with('pembuat:id,nama_lengkap')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($naskah) => [
                'id' => $naskah->id,
                'perihal' => $naskah->perihal,
                'jenis' => $naskah->jenis->value,
                'status' => $naskah->status->value,
                'status_label' => $naskah->status->label(),
                'pembuat' => $naskah->pembuat?->nama_lengkap,
                'tanggal' => $naskah->created_at,
            ]);

        return response()->json([
            'statistik' => [
                'total_naskah' => $totalNaskah,
                'naskah_draft' => $naskahDraft,
                'naskah_menunggu_verifikasi' => $naskahMenunggu,
                'naskah_masuk_hari_ini' => $naskahMasukBaru,
                'total_arsip' => $totalArsip,
                'arsip_aktif' => $arsipAktif,
                'disposisi_belum_dibaca' => $disposisiBelumDibaca,
                'notifikasi_belum_dibaca' => $notifikasiBelumDibaca,
            ],
            'aktivitas_terkini' => $aktivitasTerkini,
            'naskah_terbaru' => $naskahTerbaru,
        ]);
    }
}
