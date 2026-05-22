<?php

namespace App\Enums;

enum StatusDisposisiEnum: string
{
    case BELUM_DIBACA = 'belum_dibaca';
    case DIBACA = 'dibaca';
    case DITINDAKLANJUTI = 'ditindaklanjuti';

    public function label(): string
    {
        return match ($this) {
            self::BELUM_DIBACA => 'Belum Dibaca',
            self::DIBACA => 'Dibaca',
            self::DITINDAKLANJUTI => 'Ditindaklanjuti',
        };
    }
}
