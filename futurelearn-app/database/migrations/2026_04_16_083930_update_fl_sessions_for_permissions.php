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
        Schema::table('fl_sessions', function (Blueprint $table) {
            // Planification
           
            
            // Permissions (Cahier des charges)
            $table->boolean('allow_questions')->default(true); // Lecture/Réponse
            $table->boolean('is_moderated')->default(false);   // Modération
            $table->boolean('show_results_to_students')->default(true);
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
