<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('naskahs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nomor_naskah', 100)->nullable()->unique();
            $table->string('perihal', 255);
            $table->enum('jenis', ['masuk', 'keluar', 'draft'])->default('draft');
            $table->enum('status', [
                'draft',
                'menunggu_verifikasi',
                'disetujui',
                'ditolak',
                'ditandatangani',
                'terkirim',
                'diarsipkan',
            ])->default('draft');
            $table->longText('isi_naskah')->nullable();
            $table->string('file_path', 500)->nullable();
            $table->text('catatan_penolakan')->nullable();

            // Untuk naskah masuk
            $table->string('nomor_surat_asal', 100)->nullable();
            $table->date('tanggal_surat_asal')->nullable();
            $table->date('tanggal_terima')->nullable();
            $table->string('pengirim', 255)->nullable();

            $table->foreignUuid('dibuat_oleh')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('disetujui_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('template_id')->nullable()->constrained('template_naskahs')->nullOnDelete();
            $table->date('tanggal_naskah')->nullable();
            $table->timestamps();

            $table->index(['jenis', 'status']);
            $table->index('perihal');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('naskahs');
    }
};
