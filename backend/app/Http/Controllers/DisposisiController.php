<?php

namespace App\Http\Controllers;

use App\Models\Disposisi;
use App\Models\Naskah;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Services\NotifikasiService;
use App\Services\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DisposisiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Disposisi::with([
            'naskah:id,perihal,nomor_naskah,jenis',
            'pengirim:id,nama_lengkap,peran',
            'penerima:id,nama_lengkap,peran',
        ]);

        // Filter: masuk / keluar
        if ($request->tab === 'masuk') {
            $query->where('ke_pengguna', $user->id);
        } elseif ($request->tab === 'keluar') {
            $query->where('dari_pengguna', $user->id);
        } else {
            // Sekretaris hanya lihat disposisi yang ditujukan kepadanya
            if ($user->isSekretaris()) {
                $query->where('ke_pengguna', $user->id);
            }
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $disposisis = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_halaman', 15));

        return response()->json($disposisis);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isPimpinan()) {
            return response()->json(['message' => 'Hanya Pimpinan yang dapat membuat disposisi'], 403);
        }

        $validated = $request->validate([
            'naskah_id' => 'required|uuid|exists:naskahs,id',
            'ke_pengguna' => 'required|uuid|exists:users,id',
            'instruksi' => 'required|string',
            'batas_waktu' => 'nullable|date',
        ]);

        $validated['dari_pengguna'] = $user->id;
        $validated['status'] = 'belum_dibaca';

        $disposisi = Disposisi::create($validated);

        $naskah = Naskah::find($validated['naskah_id']);

        ActivityLogService::log('BUAT_DISPOSISI', 'DISPOSISI', $disposisi->id, [
            'naskah' => $naskah?->perihal,
        ]);

        NotifikasiService::kirim(
            $validated['ke_pengguna'],
            'Disposisi Baru',
            "Anda menerima disposisi dari {$user->nama_lengkap}: {$validated['instruksi']}",
            'DISPOSISI_BARU',
            $disposisi->id
        );

        // Kirim notifikasi WhatsApp ke penerima disposisi
        $penerima = User::find($validated['ke_pengguna']);
        if ($penerima) {
            WhatsAppService::notifDisposisi(
                $penerima,
                $user->nama_lengkap,
                $naskah?->perihal ?? '-',
                $validated['instruksi']
            );
        }

        // Auto-inject stempel jika pengirim memiliki stempel
        if ($user->stempel_path && $naskah) {
            $stempelUrl = asset('storage/' . $user->stempel_path);
            $stempelHtml = '<div style="margin-top: 10px;"><img src="' . $stempelUrl . '" alt="Stempel" style="max-height: 80px; width: auto; opacity: 0.9;" /></div>';
            
            $isiNaskah = $naskah->isi_naskah ?? '';
            if (!str_contains($isiNaskah, 'alt="Stempel"')) {
                $naskah->update(['isi_naskah' => $isiNaskah . $stempelHtml]);
            }
        }

        return response()->json([
            'message' => 'Disposisi berhasil dibuat',
            'disposisi' => $disposisi->load(['naskah:id,perihal', 'penerima:id,nama_lengkap']),
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $disposisi = Disposisi::with([
            'naskah:id,perihal,nomor_naskah,jenis,status,isi_naskah',
            'pengirim:id,nama_lengkap,peran',
            'penerima:id,nama_lengkap,peran',
        ])->findOrFail($id);

        return response()->json($disposisi);
    }

    public function baca(Request $request, string $id): JsonResponse
    {
        $disposisi = Disposisi::findOrFail($id);

        if ($disposisi->ke_pengguna !== $request->user()->id) {
            return response()->json(['message' => 'Anda bukan penerima disposisi ini'], 403);
        }

        if ($disposisi->status->value === 'belum_dibaca') {
            $disposisi->update(['status' => 'dibaca']);
        }

        return response()->json(['message' => 'Disposisi ditandai telah dibaca']);
    }

    public function tindaklanjuti(Request $request, string $id): JsonResponse
    {
        $disposisi = Disposisi::findOrFail($id);

        if ($disposisi->ke_pengguna !== $request->user()->id) {
            return response()->json(['message' => 'Anda bukan penerima disposisi ini'], 403);
        }

        $request->validate([
            'catatan' => 'nullable|string',
        ]);

        $disposisi->update([
            'status' => 'ditindaklanjuti',
            'catatan_tindak_lanjut' => $request->catatan,
            'ditindaklanjuti_pada' => now(),
        ]);

        ActivityLogService::log('TINDAKLANJUTI_DISPOSISI', 'DISPOSISI', $disposisi->id);

        NotifikasiService::kirim(
            $disposisi->dari_pengguna,
            'Disposisi Ditindaklanjuti',
            "Disposisi Anda telah ditindaklanjuti oleh {$request->user()->nama_lengkap}",
            'DISPOSISI_DITINDAKLANJUTI',
            $disposisi->id
        );

        return response()->json(['message' => 'Disposisi berhasil ditindaklanjuti']);
    }
}
