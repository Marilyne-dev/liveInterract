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
    Schema::create('fl_activities', function (Blueprint $table) {
        $table->id();
        $table->integer('session_id');
        $table->string('question');
        $table->json('options'); // Contiendra les choix ["A", "B", "C"]
        $table->string('status')->default('open'); // open, closed
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fl_activities');
    }
};
