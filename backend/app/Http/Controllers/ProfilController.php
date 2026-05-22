<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProfilController extends Controller
{
    public function uploadTtd(Request $request): JsonResponse
    {
        $request->validate([
            'tanda_tangan' => 'required|image|mimes:png,jpg,jpeg|max:2048',
        ]);

        $user = $request->user();

        if ($request->hasFile('tanda_tangan')) {
            // Hapus TTD lama jika ada
            if ($user->tanda_tangan_path && Storage::disk('public')->exists($user->tanda_tangan_path)) {
                Storage::disk('public')->delete($user->tanda_tangan_path);
            }

            $file = $request->file('tanda_tangan');
            // Simpan di disk 'public' agar bisa diakses lewat URL
            $filename = 'ttd_' . $user->id . '_' . Str::random(5) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('ttd', $filename, 'public');

            $user->update(['tanda_tangan_path' => $path]);

            return response()->json([
                'message' => 'Tanda tangan berhasil diunggah',
                'tanda_tangan_path' => $path,
                'tanda_tangan_url' => asset('storage/' . $path),
            ]);
        }

        return response()->json(['message' => 'Gagal mengunggah file'], 400);
    }
}
