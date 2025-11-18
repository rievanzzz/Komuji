<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'registration_id', 'nomor_sertifikat', 'file_path', 'generated_at',
        'status', 'display_name', 'rejected_reason', 'template_snapshot', 'sent_at'
    ];

    protected $casts = [
        'generated_at' => 'datetime',
        'sent_at' => 'datetime',
        'template_snapshot' => 'array',
    ];

    public function registration()
    {
        return $this->belongsTo(Registration::class);
    }
}
