<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('template_naskahs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nama_template', 100);
            $table->enum('jenis', ['surat_keluar', 'berita_acara', 'memo', 'undangan', 'lainnya'])->default('surat_keluar');
            $table->longText('konten_template');
            $table->boolean('aktif')->default(true);
            $table->foreignUuid('dibuat_oleh')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('template_naskahs');
    }
};
