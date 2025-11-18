<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CertificateTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'type', 'theme', 'background_path', 'default_config', 'is_active'
    ];

    protected $casts = [
        'default_config' => 'array',
        'is_active' => 'boolean',
    ];
}
