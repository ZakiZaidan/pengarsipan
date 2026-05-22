<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifikasis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pengguna_id')->constrained('users')->cascadeOnDelete();
            $table->string('judul', 255);
            $table->text('pesan');
            $table->string('tipe', 50);
            $table->uuid('referensi_id')->nullable();
            $table->boolean('sudah_dibaca')->default(false);
            $table->timestamps();

            $table->index(['pengguna_id', 'sudah_dibaca']);
            $table->index('tipe');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifikasis');
    }
};
