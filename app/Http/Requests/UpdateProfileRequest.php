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
            'phone' => ['nullable', 'string', 'min:10'], // Frontend field name
            'alamat' => ['nullable', 'string'],
            'address' => ['nullable', 'string'], // Frontend field name
            'pendidikan_terakhir' => ['nullable', 'string'],
            'last_education' => ['nullable', 'string'] // Frontend field name
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Map frontend field names to database field names
        if ($this->has('phone') && !$this->has('no_handphone')) {
            $this->merge(['no_handphone' => $this->phone]);
        }
        
        if ($this->has('address') && !$this->has('alamat')) {
            $this->merge(['alamat' => $this->address]);
        }
        
        if ($this->has('last_education') && !$this->has('pendidikan_terakhir')) {
            $this->merge(['pendidikan_terakhir' => $this->last_education]);
        }
    }
}
