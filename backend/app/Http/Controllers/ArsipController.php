<?php

namespace App\Http\Controllers;

use App\Models\Arsip;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArsipController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Arsip::with([
            'naskah:id,perihal,nomor_naskah,jenis,status',
            'pemberkasan:id,nama_lengkap',
        ]);

        if ($request->filled('status_retensi')) {
            $query->where('status_retensi', $request->status_retensi);
        }

        if ($request->filled('cari')) {
            $cari = $request->cari;
            $query->where(function ($q) use ($cari) {
                $q->where('kode_klasifikasi', 'like', "%{$cari}%")
                    ->orWhere('nama_berkas', 'like', "%{$cari}%")
                    ->orWhereHas('naskah', function ($nq) use ($cari) {
                        $nq->where('perihal', 'like', "%{$cari}%")
                            ->orWhere('nomor_naskah', 'like', "%{$cari}%");
                    });
            });
        }

        if ($request->filled('kode_klasifikasi')) {
            $query->where('kode_klasifikasi', $request->kode_klasifikasi);
        }

        $arsips = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_halaman', 15));

        return response()->json($arsips);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'naskah_id' => 'required|uuid|exists:naskahs,id',
            'kode_klasifikasi' => 'required|string|max:50',
            'nama_berkas' => 'required|string|max:255',
            'tanggal_aktif' => 'required|date',
            'tanggal_inaktif' => 'nullable|date',
            'lokasi_fisik' => 'nullable|string|max:255',
        ]);

        $validated['diberkaskan_oleh'] = $request->user()->id;
        $validated['status_retensi'] = 'aktif';

        $arsip = Arsip::create($validated);

        ActivityLogService::log('BUAT_ARSIP', 'ARSIP', $arsip->id, [
            'kode_klasifikasi' => $arsip->kode_klasifikasi,
        ]);

        return response()->json([
            'message' => 'Arsip berhasil dibuat',
            'arsip' => $arsip->load(['naskah:id,perihal,nomor_naskah']),
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $arsip = Arsip::with([
            'naskah',
            'naskah.pembuat:id,nama_lengkap',
            'pemberkasan:id,nama_lengkap',
        ])->findOrFail($id);

        return response()->json($arsip);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $arsip = Arsip::findOrFail($id);

        $validated = $request->validate([
            'kode_klasifikasi' => 'sometimes|string|max:50',
            'nama_berkas' => 'sometimes|string|max:255',
            'lokasi_fisik' => 'nullable|string|max:255',
            'tanggal_inaktif' => 'nullable|date',
        ]);

        $arsip->update($validated);

        ActivityLogService::log('EDIT_ARSIP', 'ARSIP', $arsip->id);

        return response()->json([
            'message' => 'Arsip berhasil diperbarui',
            'arsip' => $arsip->fresh(),
        ]);
    }

    public function pindahkan(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isPimpinan()) {
            return response()->json(['message' => 'Hanya Pimpinan yang dapat memindahkan arsip'], 403);
        }

        $arsip = Arsip::findOrFail($id);
        $arsip->update([
            'status_retensi' => 'inaktif',
            'tanggal_inaktif' => now()->toDateString(),
        ]);

        ActivityLogService::log('PINDAH_ARSIP_INAKTIF', 'ARSIP', $arsip->id);

        return response()->json(['message' => 'Arsip berhasil dipindahkan ke inaktif']);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isKetufor()) {
            return response()->json(['message' => 'Hanya Ketufor yang dapat menghapus arsip final'], 403);
        }

        $arsip = Arsip::findOrFail($id);

        ActivityLogService::log('HAPUS_ARSIP', 'ARSIP', $arsip->id, [
            'kode_klasifikasi' => $arsip->kode_klasifikasi,
            'nama_berkas' => $arsip->nama_berkas,
        ]);

        $arsip->update(['status_retensi' => 'musnah']);

        return response()->json(['message' => 'Arsip berhasil dimusnahkan']);
    }
}
