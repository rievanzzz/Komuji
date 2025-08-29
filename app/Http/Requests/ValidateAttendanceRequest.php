<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ValidateAttendanceRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'event_id' => ['required', 'integer', 'exists:events,id'],
            'token' => ['required', 'string']
        ];
    }
}
