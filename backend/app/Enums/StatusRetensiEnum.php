<?php

namespace App\Enums;

enum StatusRetensiEnum: string
{
    case AKTIF = 'aktif';
    case INAKTIF = 'inaktif';
    case MUSNAH = 'musnah';

    public function label(): string
    {
        return match ($this) {
            self::AKTIF => 'Aktif',
            self::INAKTIF => 'Inaktif',
            self::MUSNAH => 'Musnah',
        };
    }
}
