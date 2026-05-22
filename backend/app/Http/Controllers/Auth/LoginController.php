<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $credentials = [
            $loginField => $request->login,
            'password' => $request->password,
            'aktif' => true,
        ];

        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'login' => ['Username/email atau password salah.'],
            ]);
        }

        $request->session()->regenerate();

        $user = Auth::user();
        $user->update(['terakhir_login' => now()]);

        ActivityLogService::log('LOGIN', 'USER', $user->id);

        return response()->json([
            'message' => 'Login berhasil',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'nama_lengkap' => $user->nama_lengkap,
                'email' => $user->email,
                'peran' => $user->peran->value,
                'peran_label' => $user->peran->label(),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        ActivityLogService::log('LOGOUT', 'USER', Auth::id());

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logout berhasil']);
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'username' => $user->username,
            'nama_lengkap' => $user->nama_lengkap,
            'email' => $user->email,
            'peran' => $user->peran->value,
            'peran_label' => $user->peran->label(),
            'tanda_tangan_path' => $user->tanda_tangan_path,
            'notifikasi_belum_dibaca' => $user->notifikasis()->belumDibaca()->count(),
        ]);
    }
}
