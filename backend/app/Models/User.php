<?php

namespace App\Models;

use App\Enums\PeranEnum;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, Notifiable;

    protected $fillable = [
        'username',
        'nama_lengkap',
        'email',
        'password',
        'peran',
        'aktif',
        'tanda_tangan_path',
        'nomor_wa',
        'stempel_path',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'peran' => PeranEnum::class,
            'aktif' => 'boolean',
            'password' => 'hashed',
            'terakhir_login' => 'datetime',
        ];
    }

    // --- Helpers ---

    public function isKetufor(): bool
    {
        return $this->peran === PeranEnum::KETUFOR;
    }

    public function isWaketufor(): bool
    {
        return $this->peran === PeranEnum::WAKETUFOR;
    }

    public function isSekretaris(): bool
    {
        return $this->peran === PeranEnum::SEKRETARIS;
    }

    public function isPimpinan(): bool
    {
        return $this->isKetufor() || $this->isWaketufor();
    }

    public function isKetuaPanitia(): bool
    {
        return $this->peran === PeranEnum::KETUA_PANITIA;
    }

    // --- Relationships ---

    public function naskahs(): HasMany
    {
        return $this->hasMany(Naskah::class, 'dibuat_oleh');
    }

    public function naskahsDisetujui(): HasMany
    {
        return $this->hasMany(Naskah::class, 'disetujui_oleh');
    }

    public function disposisiDikirim(): HasMany
    {
        return $this->hasMany(Disposisi::class, 'dari_pengguna');
    }

    public function disposisiDiterima(): HasMany
    {
        return $this->hasMany(Disposisi::class, 'ke_pengguna');
    }

    public function notifikasis(): HasMany
    {
        return $this->hasMany(Notifikasi::class, 'pengguna_id');
    }

    public function logAktivitas(): HasMany
    {
        return $this->hasMany(LogAktivitas::class, 'pengguna_id');
    }

    public function templateNaskahs(): HasMany
    {
        return $this->hasMany(TemplateNaskah::class, 'dibuat_oleh');
    }

    public function eksporPdfs(): HasMany
    {
        return $this->hasMany(EksporPdf::class, 'diekspor_oleh');
    }
}
