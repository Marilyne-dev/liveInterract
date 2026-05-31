<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FlParticipant extends Model
{
    // Indique explicitement le nom de la table car il commence par fl_
    protected $table = 'fl_participants';

    protected $fillable = ['session_id', 'student_id'];
}