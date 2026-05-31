<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
            public function up(): void
        {
            Schema::table('fl_sessions', function (Blueprint $table) {
                // 1. On change status de ENUM à STRING pour accepter 'planned'
                $table->string('status')->default('active')->change();
                
                // 2. On rend duration_minutes optionnel
                $table->integer('duration_minutes')->nullable()->change();
                
                // 3. On s'assure que expires_at est nullable
                $table->timestamp('expires_at')->nullable()->change();
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
