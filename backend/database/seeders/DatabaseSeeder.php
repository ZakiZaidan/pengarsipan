<?php

namespace Database\Seeders;

use App\Models\Pengaturan;
use App\Models\TemplateNaskah;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // --- Buat Pengguna Default ---
        $ketufor = User::create([
            'username' => 'ketufor',
            'nama_lengkap' => 'Royan',
            'email' => 'ketufor@organisasi.id',
            'password' => bcrypt('password123'),
            'peran' => 'ketufor',
            'aktif' => true,
            'nomor_wa' => '6287888803983',
        ]);

        $waketufor = User::create([
            'username' => 'waketufor',
            'nama_lengkap' => 'Fahmi',
            'email' => 'waketufor@organisasi.id',
            'password' => bcrypt('password123'),
            'peran' => 'waketufor',
            'aktif' => true,
            'nomor_wa' => '6285704359736',
        ]);

        $sekretaris = User::create([
            'username' => 'sekretaris',
            'nama_lengkap' => 'Mirza Sabrina',
            'email' => 'sekretaris@organisasi.id',
            'password' => bcrypt('password123'),
            'peran' => 'sekretaris',
            'aktif' => true,
            'nomor_wa' => '62895369167700',
        ]);

        $sekretaris2 = User::create([
            'username' => 'sekretaris2',
            'nama_lengkap' => 'Siti Fadillah',
            'email' => 'sekretaris2@organisasi.id',
            'password' => bcrypt('password123'),
            'peran' => 'sekretaris',
            'aktif' => true,
            'nomor_wa' => '6287819093143',
        ]);

        // --- Buat Template Naskah Default ---
        TemplateNaskah::create([
            'nama_template' => 'Surat Keluar Resmi',
            'jenis' => 'surat_keluar',
            'konten_template' => '<div style="font-family: \'Times New Roman\', serif; font-size: 12pt;">
<p style="text-align: right;">[Kota], [Tanggal]</p>
<br>
<p>Nomor &nbsp;&nbsp;&nbsp;&nbsp;: [Nomor Surat]</p>
<p>Lampiran : [Lampiran]</p>
<p>Perihal &nbsp;&nbsp;&nbsp;: [Perihal]</p>
<br>
<p>Kepada Yth.</p>
<p>[Tujuan]</p>
<p>di Tempat</p>
<br>
<p>Dengan hormat,</p>
<p>[Isi surat]</p>
<br>
<p>Demikian surat ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.</p>
<br>
<p style="text-align: right;">Hormat kami,</p>
<br><br><br>
<p style="text-align: right;">[Nama Penandatangan]</p>
<p style="text-align: right;">[Jabatan]</p>
</div>',
            'aktif' => true,
            'dibuat_oleh' => $ketufor->id,
        ]);

        TemplateNaskah::create([
            'nama_template' => 'Memo Internal',
            'jenis' => 'memo',
            'konten_template' => '<div style="font-family: \'Times New Roman\', serif; font-size: 12pt;">
<h2 style="text-align: center; text-decoration: underline;">MEMO INTERNAL</h2>
<br>
<p>Dari &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: [Pengirim]</p>
<p>Kepada &nbsp;&nbsp;&nbsp;: [Penerima]</p>
<p>Tanggal &nbsp;&nbsp;: [Tanggal]</p>
<p>Perihal &nbsp;&nbsp;&nbsp;: [Perihal]</p>
<hr>
<br>
<p>[Isi memo]</p>
<br>
<p>Terima kasih.</p>
<br><br>
<p>[Nama Pengirim]</p>
</div>',
            'aktif' => true,
            'dibuat_oleh' => $ketufor->id,
        ]);

        TemplateNaskah::create([
            'nama_template' => 'Undangan Rapat',
            'jenis' => 'undangan',
            'konten_template' => '<div style="font-family: \'Times New Roman\', serif; font-size: 12pt;">
<p style="text-align: right;">[Kota], [Tanggal]</p>
<br>
<p>Nomor &nbsp;&nbsp;&nbsp;&nbsp;: [Nomor Surat]</p>
<p>Lampiran : -</p>
<p>Perihal &nbsp;&nbsp;&nbsp;: Undangan Rapat</p>
<br>
<p>Kepada Yth.</p>
<p>[Tujuan]</p>
<p>di Tempat</p>
<br>
<p>Dengan hormat,</p>
<p>Mengharap kehadiran Bapak/Ibu pada:</p>
<br>
<p>Hari/Tanggal &nbsp;: [Hari], [Tanggal Rapat]</p>
<p>Waktu &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: [Waktu]</p>
<p>Tempat &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: [Tempat]</p>
<p>Agenda &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: [Agenda Rapat]</p>
<br>
<p>Demikian undangan ini kami sampaikan. Atas perhatian dan kehadirannya, kami ucapkan terima kasih.</p>
<br>
<p style="text-align: right;">Hormat kami,</p>
<br><br><br>
<p style="text-align: right;">[Nama Penandatangan]</p>
<p style="text-align: right;">[Jabatan]</p>
</div>',
            'aktif' => true,
            'dibuat_oleh' => $ketufor->id,
        ]);

        // --- Pengaturan Default ---
        Pengaturan::setValue('format_nomor_surat', '{nomor}/{kode_unit}/{bulan_romawi}/{tahun}', 'penomoran');
        Pengaturan::setValue('kode_unit', 'ORG', 'penomoran');
        Pengaturan::setValue('counter_surat', '0', 'penomoran');
        Pengaturan::setValue('nama_organisasi', 'Organisasi', 'umum');
        Pengaturan::setValue('alamat_organisasi', 'Jl. Contoh No. 1, Jakarta', 'umum');
        Pengaturan::setValue('telepon_organisasi', '021-1234567', 'umum');
        Pengaturan::setValue('teks_watermark', 'RAHASIA', 'ekspor');
    }
}
