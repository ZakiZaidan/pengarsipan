<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogAktivitas extends Model
{
    use HasUuids;

    protected $table = 'log_aktivitas';

    public $timestamps = false;

    protected $fillable = [
        'pengguna_id',
        'aksi',
        'objek_tipe',
        'objek_id',
        'detail',
        'ip_address',
        'terjadi_pada',
    ];

    protected function casts(): array
    {
        return [
            'detail' => 'array',
            'terjadi_pada' => 'datetime',
        ];
    }

    // --- Relationships ---

    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pengguna_id');
    }
}
