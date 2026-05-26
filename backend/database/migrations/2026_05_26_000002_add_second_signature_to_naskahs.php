<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('naskahs', function (Blueprint $table) {
            $table->uuid('ditandatangani_oleh_2')->nullable()->after('disetujui_oleh');
            $table->foreign('ditandatangani_oleh_2')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('naskahs', function (Blueprint $table) {
            $table->dropForeign(['ditandatangani_oleh_2']);
            $table->dropColumn('ditandatangani_oleh_2');
        });
    }
};
