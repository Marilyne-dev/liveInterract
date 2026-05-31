<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::table('fl_activities', function (Blueprint $table) {
            // Ajouter les colonnes manquantes requises par le contrôleur
            if (!Schema::hasColumn('fl_activities', 'pin_code')) {
                $table->string('pin_code')->after('session_id');
            }
            if (!Schema::hasColumn('fl_activities', 'type')) {
                $table->string('type')->default('qcm')->after('pin_code');
            }
            if (!Schema::hasColumn('fl_activities', 'correct_answer')) {
                $table->string('correct_answer')->nullable()->after('options');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::table('fl_activities', function (Blueprint $table) {
            $table->dropColumn(['pin_code', 'type', 'correct_answer']);
        });
    }
};
