<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'registration_id', 'token', 'status', 'check_in_time', 'check_out_time', 'qr_code_path'
    ];

    protected $casts = [
        'check_in_time' => 'datetime',
        'check_out_time' => 'datetime',
    ];

    public function registration()
    {
        return $this->belongsTo(Registration::class);
    }

    /**
     * Get the user that owns the attendance.
     */
    public function user()
    {
        return $this->hasOneThrough(
            User::class,
            Registration::class,
            'id', // Foreign key on registrations table
            'id', // Foreign key on users table
            'registration_id', // Local key on attendances table
            'user_id' // Local key on registrations table
        );
    }
}
