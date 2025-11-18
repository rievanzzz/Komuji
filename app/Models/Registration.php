<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Registration extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'event_id', 'ticket_category_id', 'status', 'kode_pendaftaran', 'alasan_ditolak',
        'nama_peserta', 'jenis_kelamin', 'tanggal_lahir', 'email_peserta', 'total_harga',
        'payment_status', 'payment_method', 'invoice_number', 'qr_code', 'payment_expired_at',
        'is_attended'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function attendance()
    {
        return $this->hasOne(Attendance::class);
    }

    public function certificate()
    {
        return $this->hasOne(Certificate::class);
    }

    public function ticketCategory()
    {
        return $this->belongsTo(TicketCategory::class);
    }

    protected $casts = [
        'tanggal_lahir' => 'date',
        'total_harga' => 'decimal:2',
        'payment_expired_at' => 'datetime'
    ];
}
