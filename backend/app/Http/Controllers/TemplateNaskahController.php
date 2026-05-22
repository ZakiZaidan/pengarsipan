<?php

namespace App\Http\Controllers;

use App\Models\TemplateNaskah;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TemplateNaskahController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TemplateNaskah::with('pembuat:id,nama_lengkap');

        if ($request->filled('jenis')) {
            $query->where('jenis', $request->jenis);
        }

        if ($request->boolean('aktif_saja', false)) {
            $query->where('aktif', true);
        }

        $templates = $query->orderBy('nama_template')->get();

        return response()->json($templates);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isPimpinan()) {
            return response()->json(['message' => 'Tidak memiliki akses'], 403);
        }

        $validated = $request->validate([
            'nama_template' => 'required|string|max:100',
            'jenis' => 'required|in:surat_keluar,berita_acara,memo,undangan,lainnya',
            'konten_template' => 'required|string',
        ]);

        $validated['dibuat_oleh'] = $user->id;
        $validated['aktif'] = true;

        $template = TemplateNaskah::create($validated);

        ActivityLogService::log('BUAT_TEMPLATE', 'TEMPLATE', $template->id);

        return response()->json([
            'message' => 'Template berhasil dibuat',
            'template' => $template,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isPimpinan()) {
            return response()->json(['message' => 'Tidak memiliki akses'], 403);
        }

        $template = TemplateNaskah::findOrFail($id);

        $validated = $request->validate([
            'nama_template' => 'sometimes|string|max:100',
            'jenis' => 'sometimes|in:surat_keluar,berita_acara,memo,undangan,lainnya',
            'konten_template' => 'sometimes|string',
            'aktif' => 'sometimes|boolean',
        ]);

        $template->update($validated);

        ActivityLogService::log('EDIT_TEMPLATE', 'TEMPLATE', $template->id);

        return response()->json([
            'message' => 'Template berhasil diperbarui',
            'template' => $template->fresh(),
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isKetufor()) {
            return response()->json(['message' => 'Hanya Ketufor yang dapat menghapus template'], 403);
        }

        $template = TemplateNaskah::findOrFail($id);
        $template->delete();

        ActivityLogService::log('HAPUS_TEMPLATE', 'TEMPLATE', $id);

        return response()->json(['message' => 'Template berhasil dihapus']);
    }
}
