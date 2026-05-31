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
        Schema::create('fl_private_responses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('message_id'); // Référence à la question originale
            $table->string('professor_id'); // ID du prof qui répond
            $table->string('student_user_id'); // user_id de l'élève destinataire
            $table->text('content'); // Contenu de la réponse
            $table->timestamps();

            $table->foreign('message_id')->references('id')->on('fl_messages')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fl_private_responses');
    }
};
