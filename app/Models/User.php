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
        'password',
        'role',
        'no_handphone',
        'alamat',
        'pendidikan_terakhir',
        'otp',
        'otp_expires_at',
        'status_akun',
        'verification_token',
        'verification_token_expires_at'
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

    /**
     * Get the user's registrations.
     */
    public function registrations()
    {
        return $this->hasMany(Registration::class);
    }

    /**
     * Get the events that the user has registered for.
     */
    public function events()
    {
        return $this->belongsToMany(Event::class, 'registrations')
            ->withPivot('status', 'kode_pendaftaran')
            ->withTimestamps();
    }

    /**
     * Get the user's attendances through registrations.
     */
    public function attendances()
    {
        return $this->hasManyThrough(
            Attendance::class,
            Registration::class,
            'user_id',
            'registration_id',
            'id',
            'id'
        );
    }

    /**
     * Get the user's certificates through registrations.
     */
    public function certificates()
    {
        return $this->hasManyThrough(
            Certificate::class,
            Registration::class,
            'user_id',
            'registration_id',
            'id',
            'id'
        );
    }

    /**
     * Check if user has registered for an event.
     */
    public function hasRegisteredForEvent($eventId)
    {
        return $this->registrations()
            ->where('event_id', $eventId)
            ->exists();
    }

    /**
     * Check if user has attended an event.
     */
    public function hasAttendedEvent($eventId)
    {
        return $this->attendances()
            ->whereHas('registration', function($query) use ($eventId) {
                $query->where('event_id', $eventId);
            })
            ->where('is_verified', true)
            ->exists();
    }

    /**
     * Get the URL to the user's profile photo.
     */
    public function getProfilePhotoUrlAttribute()
    {
        return $this->profile_photo_path
                    ? Storage::url($this->profile_photo_path)
                    : $this->defaultProfilePhotoUrl();
    }

    /**
     * Get the default profile photo URL if no profile photo has been uploaded.
     */
    protected function defaultProfilePhotoUrl()
    {
        $name = trim(collect(explode(' ', $this->name))->map(function ($segment) {
            return mb_substr($segment, 0, 1);
        })->join(' '));

        return 'https://ui-avatars.com/api/?name='.urlencode($name).'&color=7F9CF5&background=EBF4FF';
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
