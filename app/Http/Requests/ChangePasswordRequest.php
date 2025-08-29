<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChangePasswordRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'current_password' => ['required', 'string', 'current_password:sanctum'],
            'new_password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/[a-z]/',      // must contain at least one lowercase letter
                'regex:/[A-Z]/',      // must contain at least one uppercase letter
                'regex:/[0-9]/',      // must contain at least one digit
                'regex:/[^a-zA-Z0-9]/' // must contain a special character
            ],
            'new_password_confirmation' => ['required', 'string']
        ];
    }

    public function messages()
    {
        return [
            'new_password.regex' => 'Password harus mengandung setidaknya 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 karakter spesial',
            'current_password.current_password' => 'Password saat ini tidak valid'
        ];
    }
}
