<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EksporPdf extends Model
{
    use HasUuids;

    protected $table = 'ekspor_pdfs';

    protected $fillable = [
        'naskah_id',
        'diekspor_oleh',
        'file_path',
        'dengan_watermark',
        'dengan_kop',
        'teks_watermark',
        'ukuran_kertas',
    ];

    protected function casts(): array
    {
        return [
            'dengan_watermark' => 'boolean',
            'dengan_kop' => 'boolean',
        ];
    }

    // --- Relationships ---

    public function naskah(): BelongsTo
    {
        return $this->belongsTo(Naskah::class, 'naskah_id');
    }

    public function pengekspor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diekspor_oleh');
    }
}
