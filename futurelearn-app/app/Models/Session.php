<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Session extends Model {
    protected $table = 'fl_sessions';
    protected $fillable = ['title', 'pin_code', 'duration_minutes', 'expires_at', 'status'];
}