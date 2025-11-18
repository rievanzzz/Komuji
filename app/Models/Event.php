<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'judul', 'deskripsi', 'tanggal_mulai', 'tanggal_selesai',
        'waktu_mulai', 'waktu_selesai', 'lokasi', 'flyer_path',
        'sertifikat_template_path', 'has_certificate', 'is_published', 'kuota', 'terdaftar',
        'kategori_id', 'harga_tiket', 'sertifikat_path', 'status',
        'created_by', 'approval_type',
        // certificates config
        'certificate_template_id', 'manual_issue', 'allow_certificate_reject',
        'certificate_signature_name', 'certificate_signature_title', 'certificate_signature_image_path',
        'certificate_date', 'certificate_layout_config'
    ];

    protected $appends = ['full_flyer_path', 'full_template_path'];

    /**
     * Get the URL to the event's flyer image.
     */
    public function getFullFlyerPathAttribute()
    {
        return $this->flyer_path ? asset('storage/' . $this->flyer_path) : null;
    }

    /**
     * Get the URL to the event's certificate template.
     */
    public function getFullTemplatePathAttribute()
    {
        return $this->sertifikat_template_path ? asset('storage/' . $this->sertifikat_template_path) : null;
    }

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'waktu_mulai' => 'datetime',
        'is_published' => 'boolean',
        'has_certificate' => 'boolean',
        'approval_type' => 'string',
        'waktu_selesai' => 'datetime',
        'manual_issue' => 'boolean',
        'allow_certificate_reject' => 'boolean',
        'certificate_date' => 'date',
        'certificate_layout_config' => 'array',
    ];

    /**
     * Get the category that owns the event.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'kategori_id');
    }

    /**
     * Get all registrations for the event.
     */
    /**
     * Get the user that created the event.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the registrations for the event.
     */
    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    /**
     * Scope a query to only include events created by the given user.
     */
    public function scopeCreatedBy($query, $userId)
    {
        return $query->where('created_by', $userId);
    }

    /**
     * Get all attendees for the event.
     */
    public function attendees(): HasMany
    {
        return $this->hasManyThrough(
            User::class,
            Registration::class,
            'event_id',
            'id',
            'id',
            'user_id'
        )->where('registrations.status', 'approved');
    }

    /**
     * Get all attendances for the event.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Get all certificates for the event.
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    /**
     * Certificate template relation
     */
    public function certificateTemplate(): BelongsTo
    {
        return $this->belongsTo(CertificateTemplate::class, 'certificate_template_id');
    }

    /**
     * Get all ticket categories for the event.
     */
    public function ticketCategories(): HasMany
    {
        return $this->hasMany(TicketCategory::class);
    }

    /**
     * Get all users registered for this event
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'registrations')
            ->withPivot('status', 'kode_pendaftaran')
            ->withTimestamps();
    }

    /**
     * Get validation rules for event creation/update
     *
     * @param int|null $eventId
     * @return array
     */
    public static function rules($eventId = null): array
    {
        return [
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'tanggal_mulai' => [
                'required',
                'date',
                'after_or_equal:today',
                function ($attribute, $value, $fail) {
                    $minDate = now()->addDays(3); // H-3 rule
                    if (strtotime($value) < $minDate->timestamp) {
                        $fail("Pembuatan event minimal H-3 sebelum tanggal pelaksanaan.");
                    }
                },
            ],
            'tanggal_selesai' => 'required|date|after:tanggal_mulai',
            'waktu_mulai' => 'required|date_format:H:i',
            'waktu_selesai' => 'required|date_format:H:i|after:waktu_mulai',
            'lokasi' => 'required|string|max:255',
            'kuota' => 'required|integer|min:1',
            'harga_tiket' => 'required|numeric|min:0',
            'kategori_id' => 'required|exists:categories,id',
            'flyer_path' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'sertifikat_template_path' => 'nullable|file|mimes:pdf|max:5120',
            'is_published' => 'boolean',
            'status' => 'in:draft,published,canceled,completed',
        ];
    }

    /**
     * Check if registration is open for this event
     *
     * @return bool
     */
    public function isRegistrationOpen(): bool
    {
        $now = now();
        $eventStart = \Carbon\Carbon::parse($this->tanggal_mulai->format('Y-m-d') . ' ' . $this->waktu_mulai);

        return $this->is_published &&
               $this->status === 'published' &&
               $now->lt($eventStart) && // Before event starts
               $this->terdaftar < $this->kuota; // Not full
    }

    /**
     * Check if attendance can be taken for this event
     *
     * @return bool
     */
    public function isAttendanceOpen(): bool
    {
        $now = now();
        $eventDate = $this->tanggal_mulai->format('Y-m-d');
        $today = $now->format('Y-m-d');

        // Attendance can be taken on the event day
        return $eventDate === $today;
    }
}
