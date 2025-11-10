<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PanitiaProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'rejection_reason',
        'approved_at',
        'approved_by',
        'plan_type',
        'trial_start',
        'trial_end',
        'premium_start',
        'premium_end',
        'saldo',
        'total_earnings',
        'total_fees_paid',
        'max_active_events',
        'total_events_created',
        'total_participants',
        'organization_name',
        'organization_description',
        'phone',
        'address',
        'website'
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'trial_start' => 'datetime',
        'trial_end' => 'datetime',
        'premium_start' => 'datetime',
        'premium_end' => 'datetime',
        'saldo' => 'decimal:2',
        'total_earnings' => 'decimal:2',
        'total_fees_paid' => 'decimal:2',
        'max_active_events' => 'integer',
        'total_events_created' => 'integer',
        'total_participants' => 'integer'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'panitia_id', 'user_id');
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

    public function scopeTrial($query)
    {
        return $query->where('plan_type', 'trial');
    }

    public function scopePremium($query)
    {
        return $query->where('plan_type', 'premium');
    }

    // Accessors & Mutators
    public function getIsApprovedAttribute()
    {
        return $this->status === 'approved';
    }

    public function getIsTrialAttribute()
    {
        return $this->plan_type === 'trial';
    }

    public function getIsPremiumAttribute()
    {
        return $this->plan_type === 'premium';
    }

    public function getIsFreeAttribute()
    {
        return $this->plan_type === 'free';
    }

    public function getIsTrialExpiredAttribute()
    {
        return $this->trial_end && Carbon::now()->isAfter($this->trial_end);
    }

    public function getIsPremiumExpiredAttribute()
    {
        return $this->premium_end && Carbon::now()->isAfter($this->premium_end);
    }

    public function getTrialDaysLeftAttribute()
    {
        if (!$this->trial_end) return 0;
        
        $now = Carbon::now();
        if ($now->isAfter($this->trial_end)) return 0;
        
        return $now->diffInDays($this->trial_end);
    }

    public function getPremiumDaysLeftAttribute()
    {
        if (!$this->premium_end) return 0;
        
        $now = Carbon::now();
        if ($now->isAfter($this->premium_end)) return 0;
        
        return $now->diffInDays($this->premium_end);
    }

    public function getCanCreateEventAttribute()
    {
        if (!$this->is_approved) return false;
        
        $activeEventsCount = $this->user->events()
            ->where('is_published', true)
            ->where('tanggal_selesai', '>=', now())
            ->count();
            
        return $activeEventsCount < $this->max_active_events;
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            'pending' => ['text' => 'Menunggu Persetujuan', 'color' => 'yellow'],
            'approved' => ['text' => 'Disetujui', 'color' => 'green'],
            'rejected' => ['text' => 'Ditolak', 'color' => 'red'],
            'suspended' => ['text' => 'Disuspend', 'color' => 'red']
        ];
        
        return $badges[$this->status] ?? ['text' => 'Unknown', 'color' => 'gray'];
    }

    public function getPlanBadgeAttribute()
    {
        $badges = [
            'trial' => ['text' => 'Trial', 'color' => 'blue'],
            'free' => ['text' => 'Gratis', 'color' => 'gray'],
            'premium' => ['text' => 'Premium', 'color' => 'purple']
        ];
        
        return $badges[$this->plan_type] ?? ['text' => 'Unknown', 'color' => 'gray'];
    }

    // Methods
    public function approve($approvedBy = null)
    {
        $this->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $approvedBy
        ]);
        
        // Start trial if not already started
        if (!$this->trial_start) {
            $this->startTrial();
        }
    }

    public function reject($reason = null)
    {
        $this->update([
            'status' => 'rejected',
            'rejection_reason' => $reason
        ]);
    }

    public function startTrial()
    {
        $trialDays = Setting::get('trial_duration_days', 60);
        
        $this->update([
            'plan_type' => 'trial',
            'trial_start' => now(),
            'trial_end' => now()->addDays($trialDays),
            'max_active_events' => Setting::get('premium_max_active_events', 999)
        ]);
    }

    public function upgradeToPremium($months = 1)
    {
        $this->update([
            'plan_type' => 'premium',
            'premium_start' => now(),
            'premium_end' => now()->addMonths($months),
            'max_active_events' => Setting::get('premium_max_active_events', 999)
        ]);
    }

    public function downgradeToFree()
    {
        $this->update([
            'plan_type' => 'free',
            'premium_start' => null,
            'premium_end' => null,
            'max_active_events' => Setting::get('free_max_active_events', 1)
        ]);
    }

    public function addEarnings($amount, $feeAmount = 0)
    {
        $this->increment('saldo', $amount);
        $this->increment('total_earnings', $amount);
        $this->increment('total_fees_paid', $feeAmount);
    }

    public function deductSaldo($amount)
    {
        if ($this->saldo >= $amount) {
            $this->decrement('saldo', $amount);
            return true;
        }
        return false;
    }
}
