<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void {
        Schema::create('fl_messages', function (Blueprint $table) {
            $table->id();
            $table->integer('session_id');
            $table->string('moodle_user_id'); // <--- TRÈS IMPORTANT : STRING pour accepter "STU-XXXX"
            $table->text('content');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('fl_messages');
    }
};