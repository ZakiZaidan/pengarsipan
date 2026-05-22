<?php

namespace App\Services;

use App\Models\Pengaturan;

class NomorSuratService
{
    /**
     * Generate nomor surat otomatis berdasarkan format yang dikonfigurasi.
     */
    public static function generate(): string
    {
        $format = Pengaturan::getValue('format_nomor_surat', '{nomor}/{kode_unit}/{bulan_romawi}/{tahun}');
        $kodeUnit = Pengaturan::getValue('kode_unit', 'ORG');
        $counter = (int) Pengaturan::getValue('counter_surat', '0');

        $counter++;
        Pengaturan::setValue('counter_surat', (string) $counter, 'penomoran');

        $bulanRomawi = self::bulanKeRomawi(now()->month);

        $replacements = [
            '{nomor}' => str_pad($counter, 3, '0', STR_PAD_LEFT),
            '{kode_unit}' => $kodeUnit,
            '{bulan_romawi}' => $bulanRomawi,
            '{tahun}' => now()->year,
            '{bulan}' => str_pad(now()->month, 2, '0', STR_PAD_LEFT),
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $format);
    }

    private static function bulanKeRomawi(int $bulan): string
    {
        $romawi = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV',
            5 => 'V', 6 => 'VI', 7 => 'VII', 8 => 'VIII',
            9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII',
        ];

        return $romawi[$bulan] ?? '';
    }
}
