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
    Schema::create('fl_community_messages', function (Blueprint $table) {
        $table->id();
        $table->foreignId('session_id'); // Lié à la session
        $table->string('user_id');       // ID de l'étudiant ou du prof
        $table->string('user_name');     // Nom à afficher
        $table->text('content');         // Le message
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fl_community_messages');
    }
};
