<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => ['nullable', 'string', 'max:255'],
            'no_handphone' => ['nullable', 'string', 'min:10'],
            'alamat' => ['nullable', 'string'],
            'pendidikan_terakhir' => ['nullable', 'string']
        ];
    }
}
