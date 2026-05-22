<?php

namespace App\Enums;

enum JenisTemplateEnum: string
{
    case SURAT_KELUAR = 'surat_keluar';
    case BERITA_ACARA = 'berita_acara';
    case MEMO = 'memo';
    case UNDANGAN = 'undangan';
    case LAINNYA = 'lainnya';

    public function label(): string
    {
        return match ($this) {
            self::SURAT_KELUAR => 'Surat Keluar',
            self::BERITA_ACARA => 'Berita Acara',
            self::MEMO => 'Memo',
            self::UNDANGAN => 'Undangan',
            self::LAINNYA => 'Lainnya',
        };
    }
}
