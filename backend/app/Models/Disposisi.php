<?php

namespace App\Models;

use App\Enums\StatusDisposisiEnum;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Disposisi extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'naskah_id',
        'dari_pengguna',
        'ke_pengguna',
        'instruksi',
        'batas_waktu',
        'status',
        'catatan_tindak_lanjut',
        'ditindaklanjuti_pada',
    ];

    protected function casts(): array
    {
        return [
            'status' => StatusDisposisiEnum::class,
            'batas_waktu' => 'date',
            'ditindaklanjuti_pada' => 'datetime',
        ];
    }

    // --- Relationships ---

    public function naskah(): BelongsTo
    {
        return $this->belongsTo(Naskah::class, 'naskah_id');
    }

    public function pengirim(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dari_pengguna');
    }

    public function penerima(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ke_pengguna');
    }
}
