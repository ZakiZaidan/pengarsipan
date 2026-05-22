<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PenggunaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('cari')) {
            $cari = $request->cari;
            $query->where(function ($q) use ($cari) {
                $q->where('nama_lengkap', 'like', "%{$cari}%")
                    ->orWhere('username', 'like', "%{$cari}%")
                    ->orWhere('email', 'like', "%{$cari}%");
            });
        }

        if ($request->filled('peran')) {
            $query->where('peran', $request->peran);
        }

        $pengguna = $query->orderBy('nama_lengkap')
            ->paginate($request->get('per_halaman', 15));

        return response()->json($pengguna);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isKetufor()) {
            return response()->json(['message' => 'Hanya Ketufor yang dapat menambah pengguna'], 403);
        }

        $validated = $request->validate([
            'username' => 'required|string|max:50|unique:users',
            'nama_lengkap' => 'required|string|max:100',
            'email' => 'required|email|max:100|unique:users',
            'password' => 'required|string|min:8',
            'peran' => 'required|in:ketufor,waketufor,sekretaris',
        ]);

        $validated['password'] = bcrypt($validated['password']);
        $pengguna = User::create($validated);

        ActivityLogService::log('BUAT_PENGGUNA', 'USER', $pengguna->id, [
            'username' => $pengguna->username,
            'peran' => $pengguna->peran->value,
        ]);

        return response()->json([
            'message' => 'Pengguna berhasil ditambahkan',
            'pengguna' => $pengguna,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $pengguna = User::findOrFail($id);
        return response()->json($pengguna);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isKetufor()) {
            return response()->json(['message' => 'Hanya Ketufor yang dapat mengubah pengguna'], 403);
        }

        $pengguna = User::findOrFail($id);

        $validated = $request->validate([
            'nama_lengkap' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|max:100|unique:users,email,' . $pengguna->id,
            'peran' => 'sometimes|in:ketufor,waketufor,sekretaris',
            'aktif' => 'sometimes|boolean',
            'password' => 'nullable|string|min:8',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        }

        $pengguna->update($validated);

        ActivityLogService::log('EDIT_PENGGUNA', 'USER', $pengguna->id);

        return response()->json([
            'message' => 'Pengguna berhasil diperbarui',
            'pengguna' => $pengguna->fresh(),
        ]);
    }

    public function listSemua(): JsonResponse
    {
        $pengguna = User::where('aktif', true)
            ->select('id', 'nama_lengkap', 'peran')
            ->orderBy('nama_lengkap')
            ->get();

        return response()->json($pengguna);
    }
}
