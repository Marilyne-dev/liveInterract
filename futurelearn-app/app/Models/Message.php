<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $table = 'fl_messages'; // Important car ta table commence par fl_
    protected $fillable = ['session_id', 'moodle_user_id', 'content'];
}