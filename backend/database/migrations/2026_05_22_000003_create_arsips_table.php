<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('arsips', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('naskah_id')->constrained('naskahs')->cascadeOnDelete();
            $table->string('kode_klasifikasi', 50);
            $table->string('nama_berkas', 255);
            $table->enum('status_retensi', ['aktif', 'inaktif', 'musnah'])->default('aktif');
            $table->date('tanggal_aktif');
            $table->date('tanggal_inaktif')->nullable();
            $table->string('lokasi_fisik', 255)->nullable();
            $table->foreignUuid('diberkaskan_oleh')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index('kode_klasifikasi');
            $table->index('status_retensi');
            $table->index('nama_berkas');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('arsips');
    }
};
