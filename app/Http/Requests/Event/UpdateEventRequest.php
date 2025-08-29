<?php

namespace App\Http\Requests\Event;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use App\Models\Event;

class UpdateEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $event = $this->route('event');
        return Auth::check() && 
               in_array(Auth::user()->role, ['admin', 'panitia']) && 
               ($event->created_by == Auth::id() || Auth::user()->role == 'admin');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $event = $this->route('event');
        $threeDaysFromNow = now()->addDays(3)->format('Y-m-d');
        
        $rules = [
            'judul' => 'sometimes|required|string|max:255',
            'deskripsi' => 'sometimes|required|string',
            'tanggal_mulai' => [
                'sometimes', 
                'required', 
                'date',
                'after_or_equal:' . $threeDaysFromNow
            ],
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'waktu_mulai' => 'sometimes|required|date_format:H:i',
            'waktu_selesai' => 'sometimes|required|date_format:H:i|after:waktu_mulai',
            'lokasi' => 'sometimes|required|string|max:255',
            'kuota' => 'sometimes|required|integer|min:1|min:' . $event->terdaftar,
            'kategori_id' => 'sometimes|required|exists:categories,id',
            'harga_tiket' => 'sometimes|required|numeric|min:0',
            'is_published' => 'sometimes|boolean',
            'approval_type' => 'sometimes|required|in:auto,manual',
            'flyer' => [
                'sometimes',
                'image',
                'mimes:jpeg,png,jpg',
                'max:2048' // 2MB
            ],
            'sertifikat_template' => [
                'nullable',
                'file',
                'mimes:pdf,doc,docx',
                'max:5120' // 5MB
            ]
        ];

        return $rules;
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
            'kuota.min' => 'Kuota tidak boleh kurang dari jumlah peserta yang sudah terdaftar',
            'flyer.image' => 'File poster harus berupa gambar (jpeg, png, jpg)',
            'flyer.max' => 'Ukuran file poster tidak boleh melebihi 2MB',
            'sertifikat_template.mimes' => 'File template sertifikat harus berupa PDF, DOC, atau DOCX',
            'sertifikat_template.max' => 'Ukuran file template sertifikat tidak boleh melebihi 5MB',
        ];
    }
}
