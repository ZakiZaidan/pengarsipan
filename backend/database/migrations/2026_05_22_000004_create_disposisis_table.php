<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disposisis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('naskah_id')->constrained('naskahs')->cascadeOnDelete();
            $table->foreignUuid('dari_pengguna')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('ke_pengguna')->constrained('users')->cascadeOnDelete();
            $table->text('instruksi');
            $table->date('batas_waktu')->nullable();
            $table->enum('status', ['belum_dibaca', 'dibaca', 'ditindaklanjuti'])->default('belum_dibaca');
            $table->text('catatan_tindak_lanjut')->nullable();
            $table->timestamp('ditindaklanjuti_pada')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('ke_pengguna');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disposisis');
    }
};
