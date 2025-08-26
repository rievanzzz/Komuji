<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Notifications\VerifyEmailNotification;
use App\Notifications\SendOtpNotification;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'no_handphone',
        'password',
        'alamat',
        'pendidikan_terakhir',
        'status_akun',
        'otp',
        'otp_expires_at',
        'verification_token',
        'verification_token_expires_at',
        'role',
    ];

    protected $dates = [
        'otp_expires_at',
        'verification_token_expires_at',
        'email_verified_at'
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'otp',
        'otp_expires_at',
        'verification_token',
        'verification_token_expires_at'
    ];

    protected $appends = ['is_verified'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'otp_expires_at' => 'datetime',
            'verification_token_expires_at' => 'datetime',
        ];
    }

    public function getIsVerifiedAttribute()
    {
        return $this->hasVerifiedEmail() && $this->status_akun === 'aktif';
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new VerifyEmailNotification($this));
    }

    public function sendOtpNotification($otp)
    {
        $this->notify(new SendOtpNotification($otp));
    }

    public function generateNewVerificationToken()
    {
        $this->verification_token = Str::random(60);
        $this->verification_token_expires_at = now()->addMinutes(30);
        $this->save();

        return $this->verification_token;
    }

    public function generateNewOtp()
    {
        $otp = rand(100000, 999999);
        $this->otp = $otp;
        $this->otp_expires_at = now()->addMinutes(5);
        $this->save();

        $this->sendOtpNotification($otp);

        return $otp;
    }
}
