<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'registration_id', 'token', 'waktu_hadir', 'is_verified'
    ];

    protected $casts = [
        'waktu_hadir' => 'datetime',
        'is_verified' => 'boolean',
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