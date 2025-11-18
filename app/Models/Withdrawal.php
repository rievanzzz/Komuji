<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Withdrawal extends Model
{
    use HasFactory;

    protected $fillable = [
        'withdrawal_code',
        'user_id',
        'bank_account_id',
        'amount',
        'admin_fee',
        'net_amount',
        'status',
        'notes',
        'admin_notes',
        'transfer_proof',
        'requested_at',
        'approved_at',
        'processed_at',
        'completed_at',
        'approved_by'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'admin_fee' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'requested_at' => 'datetime',
        'approved_at' => 'datetime',
        'processed_at' => 'datetime',
        'completed_at' => 'datetime'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bankAccount()
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    // Methods
    public static function generateWithdrawalCode()
    {
        do {
            $code = 'WD-' . date('Ymd') . '-' . strtoupper(Str::random(6));
        } while (self::where('withdrawal_code', $code)->exists());
        
        return $code;
    }

    public static function createWithdrawal($userId, $bankAccountId, $amount, $notes = null)
    {
        // Get admin fee from settings (default 2500)
        $adminFee = Setting::get('withdrawal_admin_fee', 2500);
        $netAmount = $amount - $adminFee;

        // Check minimum withdrawal
        $minWithdrawal = Setting::get('minimum_withdrawal_amount', 50000);
        if ($amount < $minWithdrawal) {
            throw new \Exception("Minimum withdrawal amount is Rp " . number_format($minWithdrawal));
        }

        // Check user balance
        $panitiaProfile = PanitiaProfile::where('user_id', $userId)->first();
        if (!$panitiaProfile || $panitiaProfile->saldo < $amount) {
            throw new \Exception("Insufficient balance");
        }

        // Create withdrawal request
        $withdrawal = self::create([
            'withdrawal_code' => self::generateWithdrawalCode(),
            'user_id' => $userId,
            'bank_account_id' => $bankAccountId,
            'amount' => $amount,
            'admin_fee' => $adminFee,
            'net_amount' => $netAmount,
            'status' => 'pending',
            'notes' => $notes,
            'requested_at' => now()
        ]);

        // Hold the balance (subtract from available balance)
        $panitiaProfile->decrement('saldo', $amount);

        return $withdrawal;
    }

    public function approve($adminId, $adminNotes = null)
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $adminId,
            'approved_at' => now(),
            'admin_notes' => $adminNotes
        ]);

        return $this;
    }

    public function reject($adminId, $reason)
    {
        $this->update([
            'status' => 'rejected',
            'approved_by' => $adminId,
            'admin_notes' => $reason
        ]);

        // Return balance to user
        $panitiaProfile = PanitiaProfile::where('user_id', $this->user_id)->first();
        if ($panitiaProfile) {
            $panitiaProfile->increment('saldo', $this->amount);
        }

        return $this;
    }

    public function markAsProcessed($transferProof = null)
    {
        $this->update([
            'status' => 'processed',
            'processed_at' => now(),
            'transfer_proof' => $transferProof
        ]);

        return $this;
    }

    public function markAsCompleted()
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now()
        ]);

        return $this;
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            'pending' => ['text' => 'Menunggu Persetujuan', 'color' => 'yellow'],
            'approved' => ['text' => 'Disetujui', 'color' => 'blue'],
            'processed' => ['text' => 'Sedang Diproses', 'color' => 'purple'],
            'completed' => ['text' => 'Selesai', 'color' => 'green'],
            'rejected' => ['text' => 'Ditolak', 'color' => 'red'],
            'cancelled' => ['text' => 'Dibatalkan', 'color' => 'gray']
        ];
        
        return $badges[$this->status] ?? ['text' => 'Unknown', 'color' => 'gray'];
    }

    public function getFormattedAmountAttribute()
    {
        return 'Rp ' . number_format($this->amount, 0, ',', '.');
    }

    public function getFormattedNetAmountAttribute()
    {
        return 'Rp ' . number_format($this->net_amount, 0, ',', '.');
    }
}
