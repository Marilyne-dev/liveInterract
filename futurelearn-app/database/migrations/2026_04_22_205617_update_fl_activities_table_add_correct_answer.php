<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fl_activities', function (Blueprint $table) {
            // On vérifie si la colonne 'type' existe déjà, sinon on l'ajoute
            if (!Schema::hasColumn('fl_activities', 'type')) {
                $table->string('type')->default('poll')->after('session_id');
            }

            // On ajoute la colonne 'correct_answer' qui manque pour ton QCM
            if (!Schema::hasColumn('fl_activities', 'correct_answer')) {
                $table->string('correct_answer')->nullable()->after('options');
            }
        });
    }

    public function down(): void
    {
        Schema::table('fl_activities', function (Blueprint $table) {
            $table->dropColumn(['correct_answer']);
            // On ne supprime 'type' que si on est sûr de vouloir revenir en arrière
            // $table->dropColumn(['type']); 
        });
    }
};