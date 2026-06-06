<?php

namespace Database\Seeders;

use App\Models\TemplateNaskah;
use App\Models\User;
use Illuminate\Database\Seeder;

class TemplateNaskahSeeder extends Seeder
{
    public function run(): void
    {
        $ketufor = User::where('peran', 'ketufor')->first();
        $dibuatOleh = $ketufor?->id;

        // =====================================================
        // TEMPLATE: Surat Permohonan (layout tabel seperti Word)
        // =====================================================
        $suratPermohonan = <<<'HTML'
<div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; color: #000;">

  <p style="text-align: right;">[Kota], [Tanggal]</p>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
    <tbody>
      <tr>
        <td style="width: 90px; vertical-align: top; padding: 2px 0;">No</td>
        <td style="width: 12px; vertical-align: top; padding: 2px 0;">:</td>
        <td style="vertical-align: top; padding: 2px 0;">[Nomor Surat]</td>
      </tr>
      <tr>
        <td style="vertical-align: top; padding: 2px 0;">Lampiran</td>
        <td style="vertical-align: top; padding: 2px 0;">:</td>
        <td style="vertical-align: top; padding: 2px 0;">[Jumlah Lampiran]</td>
      </tr>
      <tr>
        <td style="vertical-align: top; padding: 2px 0;"><strong>Perihal</strong></td>
        <td style="vertical-align: top; padding: 2px 0;"><strong>:</strong></td>
        <td style="vertical-align: top; padding: 2px 0;"><strong><u>[Perihal Surat]</u></strong></td>
      </tr>
    </tbody>
  </table>

  <p style="margin-top: 16px; margin-bottom: 0;">Kepada</p>
  <p style="margin: 0;">Yth, [Jabatan Tujuan]</p>
  <p style="margin: 0;">Di-</p>
  <p style="margin: 0; padding-left: 40px;">Tempat</p>

  <br>

  <p><em>Assalamu'alaikum Warahmatullahi Wabarakatuh</em></p>

  <p style="text-indent: 40px;">
    [Isi pembuka surat. Contoh: Teriring salam dan doa kami ucapkan, semoga dalam menjalankan aktivitas sehari-hari mendapat rahmat dan ridho Tuhan Yang Maha Esa. Amin.]
  </p>

  <p style="text-indent: 40px;">
    [Isi surat/maksud dan tujuan. Contoh: Sehubungan dengan akan diadakannya kegiatan ... dalam rangka ..., yang akan dilaksanakan pada:]
  </p>

  <table style="width: 70%; border-collapse: collapse; margin: 8px 0 8px 40px;">
    <tbody>
      <tr>
        <td style="width: 100px; padding: 3px 0; vertical-align: top;">Hari/Tanggal</td>
        <td style="width: 12px; padding: 3px 0; vertical-align: top;">:</td>
        <td style="padding: 3px 0; vertical-align: top;">[Hari], [Tanggal Kegiatan]</td>
      </tr>
      <tr>
        <td style="padding: 3px 0; vertical-align: top;">Pukul</td>
        <td style="padding: 3px 0; vertical-align: top;">:</td>
        <td style="padding: 3px 0; vertical-align: top;">[Waktu] WITA s/d selesai</td>
      </tr>
      <tr>
        <td style="padding: 3px 0; vertical-align: top;">Tempat</td>
        <td style="padding: 3px 0; vertical-align: top;">:</td>
        <td style="padding: 3px 0; vertical-align: top;">[Tempat Kegiatan]</td>
      </tr>
    </tbody>
  </table>

  <p style="text-indent: 40px;">
    [Isi permohonan. Contoh: Maka kami selaku panitia pelaksana, memohon agar kiranya Bapak dapat <strong>meminjamkan [Apa yang dipinjam]</strong> demi kelancaran kegiatan tersebut.]
  </p>

  <p style="text-indent: 40px;">
    Demikian surat permohonan ini kami buat, untuk digunakan sebagaimana mestinya, atas nama [Nama Organisasi], kami ucapkan terima kasih.
  </p>

  <p><em>Wassalamu'alaikum Warahmatullahi Wabarakatuh</em></p>

  <br>

  <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
    <tbody>
      <tr>
        <td style="width: 50%;"></td>
        <td style="width: 50%; text-align: center;">
          <p style="margin: 0;">[Kota], [Tanggal]</p>
          <p style="margin: 0;">Hormat Kami,</p>
          <br><br><br>
          <p style="margin: 0;"><strong><u>[TANDA_TANGAN]</u></strong></p>
          <p style="margin: 0; font-size: 10pt; text-transform: uppercase;">[Jabatan Penandatangan]</p>
        </td>
      </tr>
    </tbody>
  </table>

</div>
HTML;

        // =====================================================
        // TEMPLATE: Surat Keluar Resmi (diperbaiki pakai tabel)
        // =====================================================
        $suratKeluar = <<<'HTML'
<div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; color: #000;">

  <p style="text-align: right;">[Kota], [Tanggal]</p>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
    <tbody>
      <tr>
        <td style="width: 90px; vertical-align: top; padding: 2px 0;">Nomor</td>
        <td style="width: 12px; vertical-align: top; padding: 2px 0;">:</td>
        <td style="vertical-align: top; padding: 2px 0;">[Nomor Surat]</td>
      </tr>
      <tr>
        <td style="vertical-align: top; padding: 2px 0;">Lampiran</td>
        <td style="vertical-align: top; padding: 2px 0;">:</td>
        <td style="vertical-align: top; padding: 2px 0;">[Jumlah Lampiran]</td>
      </tr>
      <tr>
        <td style="vertical-align: top; padding: 2px 0;">Perihal</td>
        <td style="vertical-align: top; padding: 2px 0;">:</td>
        <td style="vertical-align: top; padding: 2px 0;"><strong>[Perihal Surat]</strong></td>
      </tr>
    </tbody>
  </table>

  <p style="margin-top: 16px; margin-bottom: 0;">Kepada Yth.</p>
  <p style="margin: 0;">[Nama/Jabatan Tujuan]</p>
  <p style="margin: 0;">di Tempat</p>

  <br>

  <p>Dengan hormat,</p>
  <p style="text-indent: 40px;">[Isi surat]</p>

  <br>

  <p style="text-indent: 40px;">Demikian surat ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.</p>

  <br>

  <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
    <tbody>
      <tr>
        <td style="width: 50%;"></td>
        <td style="width: 50%; text-align: center;">
          <p style="margin: 0;">Hormat kami,</p>
          <br><br><br>
          <p style="margin: 0;"><strong><u>[TANDA_TANGAN]</u></strong></p>
          <p style="margin: 0;">[Jabatan Penandatangan]</p>
        </td>
      </tr>
    </tbody>
  </table>

</div>
HTML;

        // =====================================================
        // TEMPLATE: Undangan Rapat (diperbaiki pakai tabel)
        // =====================================================
        $undanganRapat = <<<'HTML'
<div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; color: #000;">

  <p style="text-align: right;">[Kota], [Tanggal]</p>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
    <tbody>
      <tr>
        <td style="width: 90px; vertical-align: top; padding: 2px 0;">Nomor</td>
        <td style="width: 12px; vertical-align: top; padding: 2px 0;">:</td>
        <td style="vertical-align: top; padding: 2px 0;">[Nomor Surat]</td>
      </tr>
      <tr>
        <td style="vertical-align: top; padding: 2px 0;">Lampiran</td>
        <td style="vertical-align: top; padding: 2px 0;">:</td>
        <td style="vertical-align: top; padding: 2px 0;">-</td>
      </tr>
      <tr>
        <td style="vertical-align: top; padding: 2px 0;">Perihal</td>
        <td style="vertical-align: top; padding: 2px 0;">:</td>
        <td style="vertical-align: top; padding: 2px 0;"><strong>Undangan Rapat</strong></td>
      </tr>
    </tbody>
  </table>

  <p style="margin-top: 16px; margin-bottom: 0;">Kepada Yth.</p>
  <p style="margin: 0;">[Nama/Jabatan Undangan]</p>
  <p style="margin: 0;">di Tempat</p>

  <br>

  <p>Dengan hormat,</p>
  <p style="text-indent: 40px;">Mengharap kehadiran Bapak/Ibu pada:</p>

  <table style="width: 70%; border-collapse: collapse; margin: 8px 0 8px 40px;">
    <tbody>
      <tr>
        <td style="width: 110px; padding: 3px 0; vertical-align: top;">Hari/Tanggal</td>
        <td style="width: 12px; padding: 3px 0; vertical-align: top;">:</td>
        <td style="padding: 3px 0; vertical-align: top;">[Hari], [Tanggal Rapat]</td>
      </tr>
      <tr>
        <td style="padding: 3px 0; vertical-align: top;">Waktu</td>
        <td style="padding: 3px 0; vertical-align: top;">:</td>
        <td style="padding: 3px 0; vertical-align: top;">[Waktu]</td>
      </tr>
      <tr>
        <td style="padding: 3px 0; vertical-align: top;">Tempat</td>
        <td style="padding: 3px 0; vertical-align: top;">:</td>
        <td style="padding: 3px 0; vertical-align: top;">[Tempat Rapat]</td>
      </tr>
      <tr>
        <td style="padding: 3px 0; vertical-align: top;">Agenda</td>
        <td style="padding: 3px 0; vertical-align: top;">:</td>
        <td style="padding: 3px 0; vertical-align: top;">[Agenda Rapat]</td>
      </tr>
    </tbody>
  </table>

  <p style="text-indent: 40px;">Demikian undangan ini kami sampaikan. Atas perhatian dan kehadirannya, kami ucapkan terima kasih.</p>

  <br>

  <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
    <tbody>
      <tr>
        <td style="width: 50%;"></td>
        <td style="width: 50%; text-align: center;">
          <p style="margin: 0;">Hormat kami,</p>
          <br><br><br>
          <p style="margin: 0;"><strong><u>[TANDA_TANGAN]</u></strong></p>
          <p style="margin: 0;">[Jabatan Penandatangan]</p>
        </td>
      </tr>
    </tbody>
  </table>

</div>
HTML;

        // =====================================================
        // TEMPLATE: Memo Internal
        // =====================================================
        $memo = <<<'HTML'
<div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; color: #000;">

  <p style="text-align: center; font-size: 14pt;"><strong><u>MEMO INTERNAL</u></strong></p>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
    <tbody>
      <tr>
        <td style="width: 90px; padding: 3px 0; vertical-align: top;">Dari</td>
        <td style="width: 12px; padding: 3px 0; vertical-align: top;">:</td>
        <td style="padding: 3px 0; vertical-align: top;">[Pengirim]</td>
      </tr>
      <tr>
        <td style="padding: 3px 0; vertical-align: top;">Kepada</td>
        <td style="padding: 3px 0; vertical-align: top;">:</td>
        <td style="padding: 3px 0; vertical-align: top;">[Penerima]</td>
      </tr>
      <tr>
        <td style="padding: 3px 0; vertical-align: top;">Tanggal</td>
        <td style="padding: 3px 0; vertical-align: top;">:</td>
        <td style="padding: 3px 0; vertical-align: top;">[Tanggal]</td>
      </tr>
      <tr>
        <td style="padding: 3px 0; vertical-align: top;">Perihal</td>
        <td style="padding: 3px 0; vertical-align: top;">:</td>
        <td style="padding: 3px 0; vertical-align: top;"><strong>[Perihal Memo]</strong></td>
      </tr>
    </tbody>
  </table>

  <hr style="border-top: 1px solid #000;">

  <br>

  <p style="text-indent: 40px;">[Isi memo]</p>

  <br>

  <p>Terima kasih.</p>

  <br><br>

  <p><u>[Nama Pengirim]</u></p>
  <p>[Jabatan]</p>

</div>
HTML;

        // Hapus template lama dan insert yang baru
        TemplateNaskah::whereIn('nama_template', [
            'Surat Keluar Resmi',
            'Memo Internal',
            'Undangan Rapat',
            'Surat Permohonan (surat_ke)',
        ])->delete();

        TemplateNaskah::create([
            'nama_template'    => 'Surat Permohonan (surat_ke)',
            'jenis'            => 'surat_keluar',
            'konten_template'  => $suratPermohonan,
            'aktif'            => true,
            'dibuat_oleh'      => $dibuatOleh,
        ]);

        TemplateNaskah::create([
            'nama_template'    => 'Surat Keluar Resmi',
            'jenis'            => 'surat_keluar',
            'konten_template'  => $suratKeluar,
            'aktif'            => true,
            'dibuat_oleh'      => $dibuatOleh,
        ]);

        TemplateNaskah::create([
            'nama_template'    => 'Undangan Rapat',
            'jenis'            => 'undangan',
            'konten_template'  => $undanganRapat,
            'aktif'            => true,
            'dibuat_oleh'      => $dibuatOleh,
        ]);

        TemplateNaskah::create([
            'nama_template'    => 'Memo Internal',
            'jenis'            => 'memo',
            'konten_template'  => $memo,
            'aktif'            => true,
            'dibuat_oleh'      => $dibuatOleh,
        ]);

        $this->command->info('✅ Template naskah berhasil diperbarui dengan layout tabel yang proper.');
    }
}
