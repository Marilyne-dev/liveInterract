<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
    Schema::table('fl_sessions', function ($table) {
        if (!Schema::hasColumn('fl_sessions', 'status')) {
            $table->string('status')->default('active');
        }
        if (!Schema::hasColumn('fl_sessions', 'scheduled_at')) {
            $table->timestamp('scheduled_at')->nullable();
        }
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
