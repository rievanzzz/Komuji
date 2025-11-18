<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Registration;
use App\Models\CertificateTemplate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf as PDF;

class CertificateController extends Controller
{
    public function templates()
    {
        $templates = CertificateTemplate::where('is_active', true)->get();
        return response()->json(['data' => $templates]);
    }

    public function createTemplate(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'theme' => 'nullable|string|max:100',
            'background' => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:5120',
            'default_config' => 'nullable', // accept json string or array
        ]);

        // Coerce default_config
        $defaultConfig = $data['default_config'] ?? null;
        if (is_string($defaultConfig)) {
            $decoded = json_decode($defaultConfig, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $defaultConfig = $decoded;
            }
        }

        $tpl = new CertificateTemplate();
        $tpl->name = $data['name'];
        $tpl->type = 'custom';
        $tpl->theme = $data['theme'] ?? ($defaultConfig['theme'] ?? 'custom');
        $tpl->is_active = true;
        $tpl->default_config = $defaultConfig ?: [];

        if ($request->hasFile('background')) {
            $path = $request->file('background')->store('certificates/templates', 'public');
            $tpl->background_path = $path;
        }

        $tpl->save();

        return response()->json([
            'message' => 'Template berhasil dibuat',
            'data' => $tpl,
        ], 201);
    }

    public function settings(Event $event)
    {
        $this->authorize('update', $event);
        return response()->json([
            'data' => $event->only([
                'id','judul','certificate_template_id','manual_issue','allow_certificate_reject',
                'certificate_signature_name','certificate_signature_title','certificate_signature_image_path',
                'certificate_date','certificate_layout_config','has_certificate'
            ]),
        ]);
    }

    public function updateSettings(Request $request, Event $event)
    {
        $this->authorize('update', $event);

        $data = $request->validate([
            'certificate_template_id' => 'nullable|exists:certificate_templates,id',
            'manual_issue' => 'nullable|boolean',
            'allow_certificate_reject' => 'nullable|boolean',
            'certificate_signature_name' => 'nullable|string|max:255',
            'certificate_signature_title' => 'nullable|string|max:255',
            'certificate_signature_image' => 'nullable|image|mimes:png,jpg,jpeg|max:2048',
            'certificate_date' => 'nullable|date',
            // Accept as any, we'll decode JSON string if necessary
            'certificate_layout_config' => 'nullable',
        ]);

        // If layout config is a JSON string, decode it
        if ($request->has('certificate_layout_config')) {
            $raw = $request->input('certificate_layout_config');
            if (is_string($raw)) {
                $decoded = json_decode($raw, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $data['certificate_layout_config'] = $decoded;
                }
            }
        }

        if ($request->hasFile('certificate_signature_image')) {
            $path = $request->file('certificate_signature_image')->store('certificates/signatures', 'public');
            $data['certificate_signature_image_path'] = $path;
        }

        // Ensure has_certificate reflects template selection
        if (array_key_exists('certificate_template_id', $data)) {
            $data['has_certificate'] = !empty($data['certificate_template_id']);
        }

        $event->update($data);

        return response()->json(['message' => 'Pengaturan sertifikat diperbarui', 'data' => $event->fresh()]);
    }

    public function issuanceList(Event $event)
    {
        $this->authorize('update', $event);

        $registrations = $event->registrations()->with(['attendance', 'certificate'])->get()->map(function ($r) use ($event) {
            $eligible = in_array(optional($r->attendance)->status, ['checked_in', 'checked_out']);
            return [
                'registration_id' => $r->id,
                'name' => $r->nama_peserta ?? optional($r->user)->name,
                'email' => $r->email_peserta ?? optional($r->user)->email,
                'eligible' => $eligible,
                'attendance_status' => optional($r->attendance)->status,
                'certificate_status' => optional($r->certificate)->status ?? 'pending',
                'certificate_file_url' => $r->certificate && $r->certificate->file_path ? asset('storage/' . $r->certificate->file_path) : null,
                'display_name' => optional($r->certificate)->display_name,
            ];
        });

        return response()->json(['data' => [
            'event' => $event->only(['id','judul','certificate_template_id','certificate_signature_name','certificate_signature_title','certificate_date','manual_issue','allow_certificate_reject']),
            'registrations' => $registrations,
        ]]);
    }

    public function issue(Request $request, Registration $registration)
    {
        $request->validate([
            'display_name' => 'nullable|string|max:255',
        ]);

        $event = $registration->event;
        $this->authorize('update', $event);

        if (!$event->manual_issue) {
            return response()->json(['message' => 'Penerbitan manual dinonaktifkan untuk event ini'], 422);
        }

        if (!in_array(optional($registration->attendance)->status, ['checked_in', 'checked_out'])) {
            return response()->json(['message' => 'Peserta belum memenuhi syarat penerbitan (belum check-in)'], 422);
        }

        if (!$event->certificate_template_id) {
            return response()->json(['message' => 'Template sertifikat belum dipilih pada event'], 422);
        }

        // Prevent re-issuing if already processed
        $existing = $registration->certificate;
        if ($existing && $existing->status === 'generated' && $existing->file_path) {
            return response()->json([
                'message' => 'Sertifikat sudah diterbitkan',
                'file_url' => asset('storage/' . $existing->file_path),
                'certificate' => $existing,
            ], 409);
        }
        if ($existing && $existing->status === 'rejected') {
            return response()->json([
                'message' => 'Sertifikat telah ditolak',
            ], 409);
        }

        $displayName = $request->input('display_name') ?: ($registration->nama_peserta ?? optional($registration->user)->name);

        $number = 'CERT-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));

        $template = CertificateTemplate::findOrFail($event->certificate_template_id);
        $useBg = (bool) data_get($event->certificate_layout_config, 'use_background', true);
        $snapshot = [
            'template_id' => $template->id,
            'theme' => $template->theme,
            'background_path' => $useBg ? $template->background_path : null,
            'config' => $event->certificate_layout_config ?: ($template->default_config ?? []),
            'signature' => [
                'name' => $event->certificate_signature_name,
                'title' => $event->certificate_signature_title,
                'image' => $event->certificate_signature_image_path,
            ],
            'event' => [
                'title' => $event->judul,
                'date' => optional($event->certificate_date)->format('Y-m-d') ?? now()->format('Y-m-d'),
                'organizer' => optional($event->creator)->name,
            ],
        ];

        $fileName = 'certificate-' . $registration->id . '-' . time() . '.pdf';
        $filePath = 'certificates/' . $fileName;

        try {
            PDF::setOptions(['isRemoteEnabled' => true, 'chroot' => public_path(), 'dpi' => 96]);
            $pdf = PDF::loadView('certificates.system', [
                'display_name' => $displayName,
                'certificate_number' => $number,
                'snapshot' => $snapshot,
            ])->setPaper('a4', 'landscape');
        } catch (\Throwable $e) {
            // Fallback: generate minimal HTML PDF without images
            try {
                $html = '<html><head><meta charset="utf-8"><style>body{font-family:DejaVu Sans, Arial, sans-serif;margin:40px;} .title{font-size:24px;font-weight:700;margin-bottom:10px;} .name{font-size:28px;font-weight:800;margin:20px 0;} .meta{color:#555;}</style></head><body>'
                    . '<div class="title">Sertifikat</div>'
                    . '<div class="meta">No: ' . e($number) . '</div>'
                    . '<div class="meta">Event: ' . e($event->judul) . '</div>'
                    . '<div class="meta">Tanggal: ' . e(optional($event->certificate_date)->format('Y-m-d') ?? now()->format('Y-m-d')) . '</div>'
                    . '<div class="name">' . e($displayName) . '</div>'
                    . '<div class="meta">Penyelenggara: ' . e(optional($event->creator)->name) . '</div>'
                    . '</body></html>';
                PDF::setOptions(['isRemoteEnabled' => false, 'dpi' => 96]);
                $pdf = PDF::loadHTML($html)->setPaper('a4', 'landscape');
            } catch (\Throwable $e2) {
                return response()->json([
                    'message' => 'Gagal membuat PDF sertifikat',
                    'error' => config('app.debug') ? ($e->getMessage() . ' | Fallback: ' . $e2->getMessage()) : null,
                ], 500);
            }
        }

        if (!Storage::disk('public')->exists('certificates')) {
            Storage::disk('public')->makeDirectory('certificates');
        }

        Storage::disk('public')->put($filePath, $pdf->output());

        $certificate = $registration->certificate()->updateOrCreate([], [
            'nomor_sertifikat' => $number,
            'file_path' => $filePath,
            'generated_at' => now(),
            'status' => 'generated',
            'display_name' => $displayName,
            'template_snapshot' => $snapshot,
        ]);

        return response()->json([
            'message' => 'Sertifikat berhasil dibuat',
            'file_url' => asset('storage/' . $filePath),
            'certificate' => $certificate,
        ]);
    }

    public function reject(Request $request, Registration $registration)
    {
        $request->validate([
            'reason' => 'nullable|string|max:255',
        ]);

        $event = $registration->event;
        $this->authorize('update', $event);

        // Block rejection if certificate already generated
        $existing = $registration->certificate;
        if ($existing && $existing->status === 'generated') {
            return response()->json(['message' => 'Tidak dapat menolak, sertifikat sudah diterbitkan'], 422);
        }

        if (!$event->allow_certificate_reject) {
            return response()->json(['message' => 'Penolakan sertifikat dinonaktifkan untuk event ini'], 422);
        }

        $registration->certificate()->updateOrCreate([], [
            'status' => 'rejected',
            'rejected_reason' => $request->input('reason'),
        ]);

        return response()->json(['message' => 'Sertifikat ditandai ditolak']);
    }

    public function preview(Request $request, Event $event)
    {
        $this->authorize('update', $event);
        $request->validate(['display_name' => 'required|string|max:255']);
        if (!$event->certificate_template_id) {
            return response()->json(['message' => 'Template sertifikat belum dipilih pada event'], 422);
        }
        $number = 'PREVIEW-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));
        $template = CertificateTemplate::findOrFail($event->certificate_template_id);
        $snapshot = [
            'template_id' => $template->id,
            'theme' => $template->theme,
            'background_path' => (bool) data_get($event, 'certificate_layout_config.use_background', true) ? $template->background_path : null,
            'config' => $event->certificate_layout_config ?: ($template->default_config ?? []),
            'signature' => [
                'name' => $event->certificate_signature_name,
                'title' => $event->certificate_signature_title,
                'image' => $event->certificate_signature_image_path,
            ],
            'event' => [
                'title' => $event->judul,
                'date' => optional($event->certificate_date)->format('Y-m-d') ?? now()->format('Y-m-d'),
                'organizer' => optional($event->creator)->name,
            ],
        ];
        try {
            PDF::setOptions(['isRemoteEnabled' => true, 'chroot' => public_path(), 'dpi' => 96]);
            $pdf = PDF::loadView('certificates.system', [
                'display_name' => $request->input('display_name'),
                'certificate_number' => $number,
                'snapshot' => $snapshot,
            ])->setPaper('a4', 'landscape');
            return $pdf->download('certificate-preview.pdf');
        } catch (\Throwable $e) {
            // Fallback: minimal HTML preview without images
            try {
                $html = '<html><head><meta charset="utf-8"><style>body{font-family:DejaVu Sans, Arial, sans-serif;margin:40px;} .title{font-size:24px;font-weight:700;margin-bottom:10px;} .name{font-size:28px;font-weight:800;margin:20px 0;} .meta{color:#555;}</style></head><body>'
                    . '<div class="title">Preview Sertifikat</div>'
                    . '<div class="meta">No: ' . e($number) . '</div>'
                    . '<div class="meta">Event: ' . e($event->judul) . '</div>'
                    . '<div class="meta">Tanggal: ' . e(optional($event->certificate_date)->format('Y-m-d') ?? now()->format('Y-m-d')) . '</div>'
                    . '<div class="name">' . e($request->input('display_name')) . '</div>'
                    . '<div class="meta">Penyelenggara: ' . e(optional($event->creator)->name) . '</div>'
                    . '</body></html>';
                PDF::setOptions(['isRemoteEnabled' => false, 'dpi' => 96]);
                $pdf = PDF::loadHTML($html)->setPaper('a4', 'landscape');
                return $pdf->download('certificate-preview.pdf');
            } catch (\Throwable $e2) {
                return response()->json([
                    'message' => 'Gagal membuat pratinjau sertifikat',
                    'error' => config('app.debug') ? ($e->getMessage() . ' | Fallback: ' . $e2->getMessage()) : null,
                ], 500);
            }
        }
    }
}
