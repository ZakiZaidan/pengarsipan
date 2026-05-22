<?php

namespace App\Enums;

enum StatusNaskahEnum: string
{
    case DRAFT = 'draft';
    case MENUNGGU_VERIFIKASI = 'menunggu_verifikasi';
    case DISETUJUI = 'disetujui';
    case DITOLAK = 'ditolak';
    case DITANDATANGANI = 'ditandatangani';
    case TERKIRIM = 'terkirim';
    case DIARSIPKAN = 'diarsipkan';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::MENUNGGU_VERIFIKASI => 'Menunggu Verifikasi',
            self::DISETUJUI => 'Disetujui',
            self::DITOLAK => 'Ditolak',
            self::DITANDATANGANI => 'Ditandatangani',
            self::TERKIRIM => 'Terkirim',
            self::DIARSIPKAN => 'Diarsipkan',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::DRAFT => 'gray',
            self::MENUNGGU_VERIFIKASI => 'amber',
            self::DISETUJUI => 'blue',
            self::DITOLAK => 'red',
            self::DITANDATANGANI => 'indigo',
            self::TERKIRIM => 'green',
            self::DIARSIPKAN => 'slate',
        };
    }
}
