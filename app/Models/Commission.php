<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commission extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'organizer_id',
        'type',
        'percentage',
        'amount',
        'base_amount',
        'status',
        'paid_at',
        'notes'
    ];

    protected $casts = [
        'percentage' => 'decimal:2',
        'amount' => 'decimal:2',
        'base_amount' => 'decimal:2',
        'paid_at' => 'datetime'
    ];

    // Relationships
    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeEventCommission($query)
    {
        return $query->where('type', 'event_commission');
    }

    public function scopePlatformFee($query)
    {
        return $query->where('type', 'platform_fee');
    }

    // Methods
    public static function createEventCommission($transactionId, $organizerId, $baseAmount, $percentage = null)
    {
        // Get commission percentage from settings or use default
        $commissionPercentage = $percentage ?? Setting::get('event_commission_percentage', 5.0);
        $commissionAmount = ($baseAmount * $commissionPercentage) / 100;

        return self::create([
            'transaction_id' => $transactionId,
            'organizer_id' => $organizerId,
            'type' => 'event_commission',
            'percentage' => $commissionPercentage,
            'amount' => $commissionAmount,
            'base_amount' => $baseAmount,
            'status' => 'pending'
        ]);
    }

    public static function createPlatformFee($transactionId, $baseAmount, $percentage = null)
    {
        // Get platform fee percentage from settings or use default
        $feePercentage = $percentage ?? Setting::get('platform_fee_percentage', 10.0);
        $feeAmount = ($baseAmount * $feePercentage) / 100;

        return self::create([
            'transaction_id' => $transactionId,
            'organizer_id' => null, // Platform fee goes to admin
            'type' => 'platform_fee',
            'percentage' => $feePercentage,
            'amount' => $feeAmount,
            'base_amount' => $baseAmount,
            'status' => 'pending'
        ]);
    }

    public function markAsPaid()
    {
        $this->update([
            'status' => 'paid',
            'paid_at' => now()
        ]);

        // If this is event commission, add to organizer balance
        if ($this->type === 'event_commission' && $this->organizer_id) {
            $panitiaProfile = PanitiaProfile::where('user_id', $this->organizer_id)->first();
            if ($panitiaProfile) {
                $panitiaProfile->increment('saldo', $this->amount);
            }
        }

        return $this;
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            'pending' => ['text' => 'Menunggu', 'color' => 'yellow'],
            'paid' => ['text' => 'Dibayar', 'color' => 'green'],
            'hold' => ['text' => 'Ditahan', 'color' => 'red']
        ];
        
        return $badges[$this->status] ?? ['text' => 'Unknown', 'color' => 'gray'];
    }

    public function getTypeBadgeAttribute()
    {
        $badges = [
            'event_commission' => ['text' => 'Komisi Event', 'color' => 'blue'],
            'platform_fee' => ['text' => 'Biaya Platform', 'color' => 'purple']
        ];
        
        return $badges[$this->type] ?? ['text' => 'Unknown', 'color' => 'gray'];
    }
}
