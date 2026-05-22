<?php

namespace App\Enums;

enum JenisNaskahEnum: string
{
    case MASUK = 'masuk';
    case KELUAR = 'keluar';
    case DRAFT = 'draft';

    public function label(): string
    {
        return match ($this) {
            self::MASUK => 'Naskah Masuk',
            self::KELUAR => 'Naskah Keluar',
            self::DRAFT => 'Draft',
        };
    }
}
