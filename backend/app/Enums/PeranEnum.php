<?php

namespace App\Enums;

enum PeranEnum: string
{
    case KETUFOR = 'ketufor';
    case WAKETUFOR = 'waketufor';
    case SEKRETARIS = 'sekretaris';

    public function label(): string
    {
        return match ($this) {
            self::KETUFOR => 'Ketua Forum',
            self::WAKETUFOR => 'Wakil Ketua Forum',
            self::SEKRETARIS => 'Sekretaris',
        };
    }

    public function level(): int
    {
        return match ($this) {
            self::KETUFOR => 1,
            self::WAKETUFOR => 2,
            self::SEKRETARIS => 3,
        };
    }
}
