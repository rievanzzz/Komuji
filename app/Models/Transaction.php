<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'user_id',
        'panitia_id',
        'registration_id',
        'transaction_code',
        'type',
        'gross_amount',
        'platform_fee',
        'net_amount',
        'platform_fee_percentage',
        'status',
        'payment_method',
        'payment_gateway',
        'gateway_transaction_id',
        'gateway_response',
        'paid_at',
        'failed_at',
        'cancelled_at',
        'refunded_at',
        'description',
        'notes'
    ];

    protected $casts = [
        'gross_amount' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'platform_fee_percentage' => 'decimal:2',
        'gateway_response' => 'json',
        'paid_at' => 'datetime',
        'failed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'refunded_at' => 'datetime'
    ];

    // Relationships
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function panitia()
    {
        return $this->belongsTo(User::class, 'panitia_id');
    }

    public function registration()
    {
        return $this->belongsTo(Registration::class);
    }

    // Scopes
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeEventPayments($query)
    {
        return $query->where('type', 'event_payment');
    }

    public function scopePremiumSubscriptions($query)
    {
        return $query->where('type', 'premium_subscription');
    }

    // Accessors
    public function getIsPaidAttribute()
    {
        return $this->status === 'paid';
    }

    public function getIsPendingAttribute()
    {
        return $this->status === 'pending';
    }

    public function getIsFailedAttribute()
    {
        return $this->status === 'failed';
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            'pending' => ['text' => 'Menunggu', 'color' => 'yellow'],
            'paid' => ['text' => 'Berhasil', 'color' => 'green'],
            'failed' => ['text' => 'Gagal', 'color' => 'red'],
            'cancelled' => ['text' => 'Dibatalkan', 'color' => 'gray'],
            'refunded' => ['text' => 'Dikembalikan', 'color' => 'blue']
        ];
        
        return $badges[$this->status] ?? ['text' => 'Unknown', 'color' => 'gray'];
    }

    public function getTypeBadgeAttribute()
    {
        $badges = [
            'event_payment' => ['text' => 'Pembayaran Event', 'color' => 'blue'],
            'premium_subscription' => ['text' => 'Langganan Premium', 'color' => 'purple'],
            'payout' => ['text' => 'Penarikan Saldo', 'color' => 'green'],
            'refund' => ['text' => 'Pengembalian', 'color' => 'orange']
        ];
        
        return $badges[$this->type] ?? ['text' => 'Unknown', 'color' => 'gray'];
    }

    // Methods
    public static function generateTransactionCode($type = 'TRX')
    {
        do {
            $code = $type . '-' . date('Ymd') . '-' . strtoupper(Str::random(6));
        } while (self::where('transaction_code', $code)->exists());
        
        return $code;
    }

    public static function createEventPayment($eventId, $userId, $panitiaId, $grossAmount, $registrationId = null)
    {
        $feePercentage = Setting::get('platform_fee_percentage', 10);
        $platformFee = ($grossAmount * $feePercentage) / 100;
        $netAmount = $grossAmount - $platformFee;
        
        return self::create([
            'event_id' => $eventId,
            'user_id' => $userId,
            'panitia_id' => $panitiaId,
            'registration_id' => $registrationId,
            'transaction_code' => self::generateTransactionCode('EVT'),
            'type' => 'event_payment',
            'gross_amount' => $grossAmount,
            'platform_fee' => $platformFee,
            'net_amount' => $netAmount,
            'platform_fee_percentage' => $feePercentage,
            'status' => 'pending',
            'description' => 'Pembayaran tiket event'
        ]);
    }

    public static function createPremiumSubscription($userId, $grossAmount, $months = 1)
    {
        return self::create([
            'user_id' => $userId,
            'panitia_id' => $userId, // Same user for premium subscription
            'transaction_code' => self::generateTransactionCode('PRM'),
            'type' => 'premium_subscription',
            'gross_amount' => $grossAmount,
            'platform_fee' => 0, // No fee for premium subscription
            'net_amount' => $grossAmount,
            'platform_fee_percentage' => 0,
            'status' => 'pending',
            'description' => "Langganan premium {$months} bulan"
        ]);
    }

    public function markAsPaid($paymentMethod = null, $gatewayData = [])
    {
        $this->update([
            'status' => 'paid',
            'paid_at' => now(),
            'payment_method' => $paymentMethod,
            'gateway_transaction_id' => $gatewayData['transaction_id'] ?? null,
            'gateway_response' => $gatewayData
        ]);

        // Update panitia saldo if this is event payment
        if ($this->type === 'event_payment' && $this->panitia_id) {
            $panitiaProfile = PanitiaProfile::where('user_id', $this->panitia_id)->first();
            if ($panitiaProfile) {
                $panitiaProfile->addEarnings($this->net_amount, $this->platform_fee);
            }
        }

        // Upgrade to premium if this is premium subscription
        if ($this->type === 'premium_subscription') {
            $panitiaProfile = PanitiaProfile::where('user_id', $this->user_id)->first();
            if ($panitiaProfile) {
                $panitiaProfile->upgradeToPremium();
            }
        }

        return $this;
    }

    public function markAsFailed($reason = null)
    {
        $this->update([
            'status' => 'failed',
            'failed_at' => now(),
            'notes' => $reason
        ]);

        return $this;
    }

    public function cancel($reason = null)
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'notes' => $reason
        ]);

        return $this;
    }

    public function refund($reason = null)
    {
        if ($this->status !== 'paid') {
            return false;
        }

        $this->update([
            'status' => 'refunded',
            'refunded_at' => now(),
            'notes' => $reason
        ]);

        // Deduct from panitia saldo if this was event payment
        if ($this->type === 'event_payment' && $this->panitia_id) {
            $panitiaProfile = PanitiaProfile::where('user_id', $this->panitia_id)->first();
            if ($panitiaProfile) {
                $panitiaProfile->deductSaldo($this->net_amount);
            }
        }

        return $this;
    }
}
