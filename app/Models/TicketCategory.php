<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TicketCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'nama_kategori',
        'deskripsi',
        'harga',
        'kuota',
        'terjual',
        'is_active'
    ];

    protected $casts = [
        'harga' => 'decimal:2',
        'is_active' => 'boolean'
    ];

    /**
     * Get the event that owns the ticket category.
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get all registrations for this ticket category.
     */
    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    /**
     * Check if this ticket category is available for purchase.
     */
    public function isAvailable(): bool
    {
        return $this->is_active && $this->terjual < $this->kuota;
    }

    /**
     * Get remaining quota for this ticket category.
     */
    public function getRemainingQuotaAttribute(): int
    {
        return $this->kuota - $this->terjual;
    }

    /**
     * Check if this is a free ticket category.
     */
    public function isFree(): bool
    {
        return $this->harga == 0;
    }
}
