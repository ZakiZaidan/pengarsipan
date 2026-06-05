<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite doesn't enforce enum constraints, so we just need to ensure the column accepts the new value
        // For MySQL, we would ALTER the enum. For SQLite, no action needed since it's stored as text.
    }

    public function down(): void
    {
        // No rollback needed for SQLite
    }
};
