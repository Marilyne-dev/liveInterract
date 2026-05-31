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
    Schema::create('fl_answers', function (Blueprint $table) {
        $table->id();
        $table->foreignId('question_id');
        $table->integer('moodle_user_id'); // Qui a répondu
        $table->string('response_value'); // Le choix fait (A, B, C...)
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('answers');
    }
};
