<?php

namespace App\Models;

use App\Enums\JenisTemplateEnum;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TemplateNaskah extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'nama_template',
        'jenis',
        'konten_template',
        'aktif',
        'dibuat_oleh',
    ];

    protected function casts(): array
    {
        return [
            'jenis' => JenisTemplateEnum::class,
            'aktif' => 'boolean',
        ];
    }

    // --- Relationships ---

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }
}
