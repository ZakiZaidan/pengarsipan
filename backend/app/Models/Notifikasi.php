<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notifikasi extends Model
{
    use HasUuids;

    protected $fillable = [
        'pengguna_id',
        'judul',
        'pesan',
        'tipe',
        'referensi_id',
        'sudah_dibaca',
    ];

    protected function casts(): array
    {
        return [
            'sudah_dibaca' => 'boolean',
        ];
    }

    // --- Scopes ---

    public function scopeBelumDibaca($query)
    {
        return $query->where('sudah_dibaca', false);
    }

    // --- Relationships ---

    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pengguna_id');
    }
}
