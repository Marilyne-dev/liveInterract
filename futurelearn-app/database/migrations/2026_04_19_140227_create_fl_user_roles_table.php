<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('fl_user_roles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('moodle_user_id')->unique(); // ID de l'user Moodle
            $table->string('role')->default('student'); // student, teacher, admin
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('fl_user_roles'); }
};