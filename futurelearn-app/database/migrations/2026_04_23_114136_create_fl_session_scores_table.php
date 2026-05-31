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
    Schema::create('fl_session_scores', function (Blueprint $table) {
        $table->id();
        $table->integer('session_id');
        $table->string('student_id');
        $table->string('user_name');
        $table->integer('xp_points')->default(0);
        $table->integer('correct_answers')->default(0);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fl_session_scores');
    }
};
