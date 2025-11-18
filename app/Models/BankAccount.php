<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bank_name',
        'account_number',
        'account_holder_name',
        'is_verified',
        'is_primary',
        'notes'
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'is_primary' => 'boolean'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function withdrawals()
    {
        return $this->hasMany(Withdrawal::class);
    }

    // Scopes
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    // Methods
    public static function getBankList()
    {
        return [
            'BCA' => 'Bank Central Asia',
            'BNI' => 'Bank Negara Indonesia',
            'BRI' => 'Bank Rakyat Indonesia',
            'MANDIRI' => 'Bank Mandiri',
            'CIMB' => 'CIMB Niaga',
            'DANAMON' => 'Bank Danamon',
            'PERMATA' => 'Bank Permata',
            'MAYBANK' => 'Maybank Indonesia',
            'OCBC' => 'OCBC NISP',
            'PANIN' => 'Panin Bank'
        ];
    }

    public function getFormattedAccountNumberAttribute()
    {
        // Format: 1234-5678-9012
        $number = $this->account_number;
        if (strlen($number) >= 8) {
            return substr($number, 0, 4) . '-' . substr($number, 4, 4) . '-' . substr($number, 8);
        }
        return $number;
    }

    public function getMaskedAccountNumberAttribute()
    {
        // Format: 1234-****-**12
        $number = $this->account_number;
        if (strlen($number) >= 8) {
            return substr($number, 0, 4) . '-****-**' . substr($number, -2);
        }
        return '****-****-**' . substr($number, -2);
    }

    public function setBankName($bankCode)
    {
        $bankList = self::getBankList();
        $this->bank_name = $bankList[$bankCode] ?? $bankCode;
    }

    public function setAsPrimary()
    {
        // Remove primary from other accounts
        self::where('user_id', $this->user_id)->update(['is_primary' => false]);
        
        // Set this as primary
        $this->update(['is_primary' => true]);
    }
}
