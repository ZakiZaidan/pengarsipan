<?php

namespace App\Http\Controllers;

use App\Models\Pengaturan;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PengaturanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Pengaturan::query();

        if ($request->filled('grup')) {
            $query->where('grup', $request->grup);
        }

        return response()->json($query->orderBy('grup')->orderBy('kunci')->get());
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isKetufor()) {
            return response()->json(['message' => 'Hanya Ketufor yang dapat mengubah pengaturan'], 403);
        }

        $request->validate([
            'pengaturan' => 'required|array',
            'pengaturan.*.kunci' => 'required|string',
            'pengaturan.*.nilai' => 'nullable|string',
            'pengaturan.*.grup' => 'nullable|string',
        ]);

        foreach ($request->pengaturan as $item) {
            Pengaturan::setValue(
                $item['kunci'],
                $item['nilai'] ?? '',
                $item['grup'] ?? 'umum'
            );
        }

        ActivityLogService::log('UBAH_PENGATURAN', 'PENGATURAN', null, [
            'kunci' => array_column($request->pengaturan, 'kunci'),
        ]);

        return response()->json(['message' => 'Pengaturan berhasil diperbarui']);
    }

    public function uploadKop(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isPimpinan()) {
            return response()->json(['message' => 'Tidak memiliki akses'], 403);
        }

        $request->validate([
            'kop' => 'required|image|max:5120',
        ]);

        $path = $request->file('kop')->store('kop', 'public');
        Pengaturan::setValue('kop_path', $path, 'ekspor');

        ActivityLogService::log('UPLOAD_KOP', 'PENGATURAN', null);

        return response()->json([
            'message' => 'Kop organisasi berhasil diunggah',
            'path' => $path,
        ]);
    }
}
