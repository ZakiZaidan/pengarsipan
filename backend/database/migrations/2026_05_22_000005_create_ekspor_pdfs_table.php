<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ekspor_pdfs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('naskah_id')->constrained('naskahs')->cascadeOnDelete();
            $table->foreignUuid('diekspor_oleh')->constrained('users')->cascadeOnDelete();
            $table->string('file_path', 500);
            $table->boolean('dengan_watermark')->default(false);
            $table->boolean('dengan_kop')->default(true);
            $table->string('teks_watermark', 100)->nullable();
            $table->string('ukuran_kertas', 10)->default('A4');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ekspor_pdfs');
    }
};
