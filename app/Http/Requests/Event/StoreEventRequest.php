<?php

namespace App\Http\Requests\Event;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class StoreEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check() && in_array(Auth::user()->role, ['admin', 'panitia']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $threeDaysFromNow = now()->addDays(3)->format('Y-m-d');

        return [
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'tanggal_mulai' => [
                'required',
                'date',
                'after_or_equal:' . $threeDaysFromNow
            ],
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'waktu_mulai' => 'required|date_format:H:i',
            'waktu_selesai' => 'required|date_format:H:i|after:waktu_mulai',
            'lokasi' => 'required|string|max:255',
            'kuota' => 'required|integer|min:1',
            'kategori_id' => 'required|exists:categories,id',
            'harga_tiket' => 'required|numeric|min:0',
            'is_published' => 'boolean',
            'approval_type' => 'required|in:auto,manual',
            'flyer' => [
                'required',
                'image',
                'mimes:jpeg,png,jpg',
                'max:2048' // 2MB
            ],
            'sertifikat_template' => [
                'nullable',
                'file',
                'mimes:jpeg,png,jpg,webp,pdf',
                'max:5120' // 5MB
            ],
            'certificate_template_id' => 'nullable|exists:certificate_templates,id'
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tanggal_mulai.after_or_equal' => 'Tanggal mulai harus minimal 3 hari dari sekarang',
            'waktu_selesai.after' => 'Waktu selesai harus setelah waktu mulai',
            'flyer.required' => 'Poster event wajib diunggah',
            'flyer.image' => 'File poster harus berupa gambar (jpeg, png, jpg)',
            'flyer.max' => 'Ukuran file poster tidak boleh melebihi 2MB',
            'sertifikat_template.mimes' => 'File template sertifikat harus berupa PDF, DOC, atau DOCX',
            'sertifikat_template.max' => 'Ukuran file template sertifikat tidak boleh melebihi 5MB',
        ];
    }
}
