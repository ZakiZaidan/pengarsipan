<?php

namespace App\Models;

use App\Enums\StatusRetensiEnum;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Arsip extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'naskah_id',
        'kode_klasifikasi',
        'nama_berkas',
        'status_retensi',
        'tanggal_aktif',
        'tanggal_inaktif',
        'lokasi_fisik',
        'diberkaskan_oleh',
    ];

    protected function casts(): array
    {
        return [
            'status_retensi' => StatusRetensiEnum::class,
            'tanggal_aktif' => 'date',
            'tanggal_inaktif' => 'date',
        ];
    }

    // --- Relationships ---

    public function naskah(): BelongsTo
    {
        return $this->belongsTo(Naskah::class, 'naskah_id');
    }

    public function pemberkasan(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diberkaskan_oleh');
    }
}
