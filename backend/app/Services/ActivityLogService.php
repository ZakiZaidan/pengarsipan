<?php

namespace App\Services;

use App\Models\LogAktivitas;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class ActivityLogService
{
    public static function log(
        string $aksi,
        ?string $objekTipe = null,
        ?string $objekId = null,
        ?array $detail = null
    ): LogAktivitas {
        return LogAktivitas::create([
            'pengguna_id' => Auth::id(),
            'aksi' => $aksi,
            'objek_tipe' => $objekTipe,
            'objek_id' => $objekId,
            'detail' => $detail,
            'ip_address' => Request::ip(),
            'terjadi_pada' => now(),
        ]);
    }
}
