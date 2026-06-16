<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Alter enum column to include new roles only if using MySQL/MariaDB
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN peran ENUM('ketufor', 'waketufor', 'penasehat', 'ketua_harian', 'sekretaris', 'ketua_panitia') DEFAULT 'sekretaris'");
        }

        // Seed jabatan settings for TTD format
        $jabatanSettings = [
            ['kunci' => 'jabatan_ketufor', 'nilai' => 'KETUA FORUM DUTA ANTI NARKOBA KOTA BALIKPAPAN', 'grup' => 'jabatan'],
            ['kunci' => 'jabatan_waketufor', 'nilai' => 'WAKIL KETUA FORUM DUTA ANTI NARKOBA KOTA BALIKPAPAN', 'grup' => 'jabatan'],
            ['kunci' => 'jabatan_penasehat', 'nilai' => 'PENASEHAT FORUM DUTA ANTI NARKOBA KOTA BALIKPAPAN', 'grup' => 'jabatan'],
            ['kunci' => 'jabatan_ketua_harian', 'nilai' => 'KETUA HARIAN FORUM DUTA ANTI NARKOBA KOTA BALIKPAPAN', 'grup' => 'jabatan'],
            ['kunci' => 'jabatan_sekretaris', 'nilai' => 'SEKRETARIS FORUM DUTA ANTI NARKOBA KOTA BALIKPAPAN', 'grup' => 'jabatan'],
            ['kunci' => 'jabatan_ketua_panitia', 'nilai' => 'KETUA PANITIA FORUM DUTA ANTI NARKOBA KOTA BALIKPAPAN', 'grup' => 'jabatan'],
        ];

        foreach ($jabatanSettings as $setting) {
            DB::table('pengaturans')->updateOrInsert(
                ['kunci' => $setting['kunci']],
                array_merge($setting, [
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN peran ENUM('ketufor', 'waketufor', 'sekretaris', 'ketua_panitia') DEFAULT 'sekretaris'");
        }

        DB::table('pengaturans')->where('grup', 'jabatan')->delete();
    }
};
