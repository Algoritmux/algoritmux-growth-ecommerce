<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreLeadMagnetLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'string', 'email:rfc', 'max:254'],
            'lead_magnet' => [
                'required',
                'string',
                'max:100',
                Rule::in(array_keys(config('lead-magnets.items', []))),
            ],
            'newsletter_consent' => ['sometimes', 'boolean'],
            'source_page' => ['nullable', 'string', 'max:255'],
            'utm_source' => ['nullable', 'string', 'max:255'],
            'utm_medium' => ['nullable', 'string', 'max:255'],
            'utm_campaign' => ['nullable', 'string', 'max:255'],
            'utm_content' => ['nullable', 'string', 'max:255'],
            'utm_term' => ['nullable', 'string', 'max:255'],
            'company_website' => ['nullable', 'string', 'max:0'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $trimmedFields = [
            'name',
            'lead_magnet',
            'source_page',
            'utm_source',
            'utm_medium',
            'utm_campaign',
            'utm_content',
            'utm_term',
            'company_website',
        ];
        $normalized = [];

        foreach ($trimmedFields as $field) {
            $value = $this->input($field);

            if (is_string($value)) {
                $value = trim($value);
                $normalized[$field] = $value !== '' ? $value : null;
            }
        }

        $email = $this->input('email');
        $normalized['email'] = is_string($email)
            ? mb_strtolower(trim($email))
            : $email;
        $this->merge($normalized);
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'message' => 'Os dados enviados são inválidos.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
