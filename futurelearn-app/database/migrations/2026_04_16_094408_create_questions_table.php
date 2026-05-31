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
    Schema::create('fl_questions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('session_id'); // Lié à fl_sessions
        $table->string('title'); // La question
        $table->enum('type', ['poll', 'text']); // QCM ou Question ouverte
        $table->boolean('is_active')->default(false); // Est-ce qu'elle est affichée ?
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
