<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('log_aktivitas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pengguna_id')->constrained('users')->cascadeOnDelete();
            $table->string('aksi', 100);
            $table->string('objek_tipe', 50)->nullable();
            $table->uuid('objek_id')->nullable();
            $table->json('detail')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('terjadi_pada')->useCurrent();

            $table->index('aksi');
            $table->index('objek_tipe');
            $table->index('terjadi_pada');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('log_aktivitas');
    }
};
