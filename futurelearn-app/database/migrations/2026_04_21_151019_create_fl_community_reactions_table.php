<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up() {
        Schema::create('fl_community_reactions', function ($table) {
            $table->id();
            $table->foreignId('message_id'); // ID du message communautaire
            $table->string('type'); // 'like', 'love', etc.
            $table->string('user_id'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fl_community_reactions');
    }
};
