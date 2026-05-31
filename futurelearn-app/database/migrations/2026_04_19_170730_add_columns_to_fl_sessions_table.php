<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('fl_sessions', function (Blueprint $table) {
            // On ajoute les colonnes manquantes
            if (!Schema::hasColumn('fl_sessions', 'status')) {
                $table->string('status')->default('active')->after('pin_code');
            }
            if (!Schema::hasColumn('fl_sessions', 'scheduled_at')) {
                $table->timestamp('scheduled_at')->nullable()->after('status');
            }
            // On s'assure que expires_at peut être nul (pour les planifications)
            $table->timestamp('expires_at')->nullable()->change();
        });
    }

    public function down(): void {
        Schema::table('fl_sessions', function (Blueprint $table) {
            $table->dropColumn(['status', 'scheduled_at']);
        });
    }
};