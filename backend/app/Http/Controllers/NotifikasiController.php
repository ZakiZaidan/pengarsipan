<?php

namespace App\Http\Controllers;

use App\Models\Notifikasi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifikasis = Notifikasi::where('pengguna_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_halaman', 20));

        return response()->json($notifikasis);
    }

    public function belumDibaca(Request $request): JsonResponse
    {
        $count = Notifikasi::where('pengguna_id', $request->user()->id)
            ->belumDibaca()
            ->count();

        $notifikasis = Notifikasi::where('pengguna_id', $request->user()->id)
            ->belumDibaca()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'count' => $count,
            'notifikasis' => $notifikasis,
        ]);
    }

    public function baca(Request $request, string $id): JsonResponse
    {
        $notifikasi = Notifikasi::where('pengguna_id', $request->user()->id)
            ->findOrFail($id);

        $notifikasi->update(['sudah_dibaca' => true]);

        return response()->json(['message' => 'Notifikasi ditandai telah dibaca']);
    }

    public function bacaSemua(Request $request): JsonResponse
    {
        Notifikasi::where('pengguna_id', $request->user()->id)
            ->belumDibaca()
            ->update(['sudah_dibaca' => true]);

        return response()->json(['message' => 'Semua notifikasi ditandai telah dibaca']);
    }
}
