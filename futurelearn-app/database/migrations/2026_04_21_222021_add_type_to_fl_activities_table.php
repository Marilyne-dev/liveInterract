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
        Schema::table('fl_activities', function (Blueprint $table) {
            // On ajoute la colonne pour stocker la bonne réponse (ex: "Paris")
            $table->string('correct_answer')->nullable()->after('options');
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fl_activities', function (Blueprint $table) {
            //
        });
    }
};
