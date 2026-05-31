<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fl_sessions', function (Blueprint $table) {
            // On vérifie si la colonne 'status' n'existe PAS avant de l'ajouter
            if (!Schema::hasColumn('fl_sessions', 'status')) {
                $table->string('status')->default('active')->after('pin_code');
            }
            
            // On vérifie si la colonne 'scheduled_at' n'existe PAS avant de l'ajouter
            if (!Schema::hasColumn('fl_sessions', 'scheduled_at')) {
                $table->timestamp('scheduled_at')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('fl_sessions', function (Blueprint $table) {
            // Suppression sécurisée
            if (Schema::hasColumn('fl_sessions', 'status')) {
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('fl_sessions', 'scheduled_at')) {
                $table->dropColumn('scheduled_at');
            }
        });
    }
};