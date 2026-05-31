<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('fl_participants', function (Blueprint $table) {
            $table->id();
            $table->integer('session_id');
            $table->string('student_id'); // String pour accepter les STU-XXXX
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('fl_participants');
    }
};