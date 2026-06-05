<?php

namespace App\Models;

use App\Enums\JenisNaskahEnum;
use App\Enums\StatusNaskahEnum;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Naskah extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'nomor_naskah',
        'perihal',
        'jenis',
        'status',
        'isi_naskah',
        'file_path',
        'catatan_penolakan',
        'nomor_surat_asal',
        'tanggal_surat_asal',
        'tanggal_terima',
        'pengirim',
        'dibuat_oleh',
        'disetujui_oleh',
        'ditandatangani_oleh_2',
        'template_id',
        'tanggal_naskah',
    ];

    protected function casts(): array
    {
        return [
            'jenis' => JenisNaskahEnum::class,
            'status' => StatusNaskahEnum::class,
            'tanggal_naskah' => 'date',
            'tanggal_surat_asal' => 'date',
            'tanggal_terima' => 'date',
        ];
    }

    // --- Scopes ---

    public function scopeDraft($query)
    {
        return $query->where('jenis', JenisNaskahEnum::DRAFT);
    }

    public function scopeMasuk($query)
    {
        return $query->where('jenis', JenisNaskahEnum::MASUK);
    }

    public function scopeKeluar($query)
    {
        return $query->where('jenis', JenisNaskahEnum::KELUAR);
    }

    public function scopeStatus($query, StatusNaskahEnum $status)
    {
        return $query->where('status', $status);
    }

    // --- Relationships ---

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    public function penyetuju(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disetujui_oleh');
    }

    public function penandatanganKedua(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ditandatangani_oleh_2');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(TemplateNaskah::class, 'template_id');
    }

    public function arsip(): HasOne
    {
        return $this->hasOne(Arsip::class, 'naskah_id');
    }

    public function disposisis(): HasMany
    {
        return $this->hasMany(Disposisi::class, 'naskah_id');
    }

    public function eksporPdfs(): HasMany
    {
        return $this->hasMany(EksporPdf::class, 'naskah_id');
    }
}
