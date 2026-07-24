<?php

namespace App\Http\Requests;

use App\Support\WebsiteNormalizer;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreDiagnosticLeadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'whatsapp' => ['required', 'string', 'regex:/^\d{10,20}$/'],
            'email' => ['required', 'string', 'email:rfc', 'max:254'],
            'company_name' => ['required', 'string', 'max:255'],
            'website' => ['nullable', 'string', 'max:255', function (string $attribute, mixed $value, \Closure $fail): void {
                if (! WebsiteNormalizer::isValid($value)) {
                    $fail('Informe um site válido.');
                }
            }],
            'revenue_range' => [
                'required',
                'string',
                Rule::in([
                    'up_to_50000',
                    '50001_75000',
                    '75001_150000',
                    '150001_250000',
                    '250001_500000',
                    'above_500000',
                ]),
            ],
            'source_page' => ['nullable', 'string', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $email = $this->input('email');
        $website = $this->input('website');

        $this->merge([
            'email' => is_string($email) ? mb_strtolower(trim($email)) : $email,
            'whatsapp' => preg_replace('/\D+/', '', (string) $this->input('whatsapp')),
            'website' => WebsiteNormalizer::normalize($website),
        ]);
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'message' => 'Os dados enviados são inválidos.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
