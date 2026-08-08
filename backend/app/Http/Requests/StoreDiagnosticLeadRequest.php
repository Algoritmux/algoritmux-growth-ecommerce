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
            'whatsapp' => ['nullable', 'string', 'regex:/^(?:55)?\d{10,11}$/'],
            'email' => ['nullable', 'string', 'email:rfc', 'max:254'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'website' => ['nullable', 'string', 'max:255', function (string $attribute, mixed $value, \Closure $fail): void {
                if (! WebsiteNormalizer::isValid($value)) {
                    $fail('Informe um site válido.');
                }
            }],
            'revenue_range' => [
                'nullable',
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
            'utm_source' => ['nullable', 'string', 'max:255'],
            'utm_medium' => ['nullable', 'string', 'max:255'],
            'utm_campaign' => ['nullable', 'string', 'max:255'],
            'utm_content' => ['nullable', 'string', 'max:255'],
            'utm_term' => ['nullable', 'string', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $name = $this->input('name');
        $email = $this->input('email');
        $companyName = $this->input('company_name');
        $revenueRange = $this->input('revenue_range');
        $website = $this->input('website');
        $whatsappInput = $this->input('whatsapp');
        $whatsappDigits = preg_replace('/\D+/', '', (string) $whatsappInput);

        $this->merge([
            'name' => is_string($name) ? trim($name) : $name,
            'email' => is_string($email)
                ? (trim($email) !== '' ? mb_strtolower(trim($email)) : null)
                : $email,
            'whatsapp' => is_string($whatsappInput)
                ? match (true) {
                    trim($whatsappInput) === '' => null,
                    $whatsappDigits !== '' => $whatsappDigits,
                    default => trim($whatsappInput),
                }
                : $whatsappInput,
            'company_name' => is_string($companyName)
                ? (trim($companyName) !== '' ? trim($companyName) : null)
                : $companyName,
            'revenue_range' => is_string($revenueRange)
                ? (trim($revenueRange) !== '' ? trim($revenueRange) : null)
                : $revenueRange,
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
