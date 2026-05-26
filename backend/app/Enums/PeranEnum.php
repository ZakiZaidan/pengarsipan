<?php

namespace App\Enums;

enum PeranEnum: string
{
    case KETUFOR = 'ketufor';
    case WAKETUFOR = 'waketufor';
    case SEKRETARIS = 'sekretaris';
    case KETUA_PANITIA = 'ketua_panitia';

    public function label(): string
    {
        return match ($this) {
            self::KETUFOR => 'Ketua Forum',
            self::WAKETUFOR => 'Wakil Ketua Forum',
            self::SEKRETARIS => 'Sekretaris',
            self::KETUA_PANITIA => 'Ketua Panitia',
        };
    }

    public function level(): int
    {
        return match ($this) {
            self::KETUFOR => 1,
            self::WAKETUFOR => 2,
            self::SEKRETARIS => 3,
            self::KETUA_PANITIA => 4,
        };
    }
}
