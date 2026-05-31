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
        Schema::create('fl_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('title');            // Nom du cours
            $table->string('pin_code')->unique(); // Code unique pour les élèves
            $table->integer('duration_minutes');  // Durée (ex: 60)
            $table->timestamp('expires_at');    // Heure exacte de fin
            $table->enum('status', ['active', 'closed'])->default('active');
            
            // Lien avec l'ID du professeur dans la table mdl_user de Moodle
            $table->unsignedBigInteger('moodle_user_id'); 
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fl_sessions');
    }
};
