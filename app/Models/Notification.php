<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'message',
        'type',
        'data',
        'is_read',
        'read_at'
    ];

    protected $casts = [
        'data' => 'json',
        'is_read' => 'boolean',
        'read_at' => 'datetime'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Accessors
    public function getTypeBadgeAttribute()
    {
        $badges = [
            'panitia_approved' => ['text' => 'Persetujuan', 'color' => 'green', 'icon' => 'check-circle'],
            'panitia_rejected' => ['text' => 'Penolakan', 'color' => 'red', 'icon' => 'x-circle'],
            'trial_ending' => ['text' => 'Trial Berakhir', 'color' => 'yellow', 'icon' => 'clock'],
            'trial_ended' => ['text' => 'Trial Habis', 'color' => 'red', 'icon' => 'x-circle'],
            'premium_expired' => ['text' => 'Premium Habis', 'color' => 'orange', 'icon' => 'alert-circle'],
            'event_registered' => ['text' => 'Pendaftaran', 'color' => 'blue', 'icon' => 'user-plus'],
            'payment_success' => ['text' => 'Pembayaran', 'color' => 'green', 'icon' => 'credit-card'],
            'payment_failed' => ['text' => 'Pembayaran Gagal', 'color' => 'red', 'icon' => 'credit-card'],
            'general' => ['text' => 'Umum', 'color' => 'gray', 'icon' => 'bell']
        ];
        
        return $badges[$this->type] ?? $badges['general'];
    }

    // Methods
    public function markAsRead()
    {
        if (!$this->is_read) {
            $this->update([
                'is_read' => true,
                'read_at' => now()
            ]);
        }
        
        return $this;
    }

    public function markAsUnread()
    {
        $this->update([
            'is_read' => false,
            'read_at' => null
        ]);
        
        return $this;
    }

    // Static methods for creating notifications
    public static function createForUser($userId, $title, $message, $type = 'general', $data = null)
    {
        return self::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'data' => $data
        ]);
    }

    public static function notifyPanitiaApproved($userId)
    {
        return self::createForUser(
            $userId,
            'Akun Panitia Disetujui!',
            'Selamat! Akun panitia Anda telah disetujui. Anda dapat mulai membuat event sekarang.',
            'panitia_approved'
        );
    }

    public static function notifyPanitiaRejected($userId, $reason = null)
    {
        $message = 'Maaf, akun panitia Anda ditolak.';
        if ($reason) {
            $message .= ' Alasan: ' . $reason;
        }
        
        return self::createForUser(
            $userId,
            'Akun Panitia Ditolak',
            $message,
            'panitia_rejected',
            ['reason' => $reason]
        );
    }

    public static function notifyTrialEnding($userId, $daysLeft)
    {
        return self::createForUser(
            $userId,
            'Trial Akan Berakhir',
            "Trial akun premium Anda akan berakhir dalam {$daysLeft} hari. Upgrade ke premium untuk melanjutkan fitur lengkap.",
            'trial_ending',
            ['days_left' => $daysLeft]
        );
    }

    public static function notifyTrialEnded($userId)
    {
        return self::createForUser(
            $userId,
            'Trial Berakhir',
            'Trial akun premium Anda telah berakhir. Akun Anda sekarang menggunakan paket gratis dengan fitur terbatas.',
            'trial_ended'
        );
    }

    public static function notifyPremiumExpired($userId)
    {
        return self::createForUser(
            $userId,
            'Langganan Premium Berakhir',
            'Langganan premium Anda telah berakhir. Perpanjang langganan untuk melanjutkan fitur premium.',
            'premium_expired'
        );
    }

    public static function notifyEventRegistration($userId, $eventTitle)
    {
        return self::createForUser(
            $userId,
            'Pendaftaran Event Berhasil',
            "Anda berhasil mendaftar untuk event: {$eventTitle}",
            'event_registered',
            ['event_title' => $eventTitle]
        );
    }

    public static function notifyPaymentSuccess($userId, $amount, $description)
    {
        return self::createForUser(
            $userId,
            'Pembayaran Berhasil',
            "Pembayaran sebesar Rp " . number_format($amount, 0, ',', '.') . " untuk {$description} berhasil diproses.",
            'payment_success',
            ['amount' => $amount, 'description' => $description]
        );
    }

    public static function notifyPaymentFailed($userId, $amount, $description)
    {
        return self::createForUser(
            $userId,
            'Pembayaran Gagal',
            "Pembayaran sebesar Rp " . number_format($amount, 0, ',', '.') . " untuk {$description} gagal diproses.",
            'payment_failed',
            ['amount' => $amount, 'description' => $description]
        );
    }
}
