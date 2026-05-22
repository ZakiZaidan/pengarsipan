<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Pengaturan extends Model
{
    use HasUuids;

    protected $fillable = [
        'kunci',
        'nilai',
        'grup',
    ];

    /**
     * Get a setting value by key, with optional default.
     */
    public static function getValue(string $kunci, mixed $default = null): mixed
    {
        $pengaturan = static::where('kunci', $kunci)->first();
        return $pengaturan ? $pengaturan->nilai : $default;
    }

    /**
     * Set a setting value by key.
     */
    public static function setValue(string $kunci, mixed $nilai, string $grup = 'umum'): static
    {
        return static::updateOrCreate(
            ['kunci' => $kunci],
            ['nilai' => $nilai, 'grup' => $grup]
        );
    }
}
