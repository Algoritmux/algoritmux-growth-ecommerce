<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDiagnosticLeadRequest;
use App\Models\DiagnosticLead;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class DiagnosticLeadController extends Controller
{
    public function store(StoreDiagnosticLeadRequest $request): JsonResponse
    {
        $lead = DiagnosticLead::create([
            ...$request->validated(),
            'public_id' => (string) Str::uuid(),
            'status' => 'new',
        ]);

        return response()->json([
            'message' => 'Lead de diagnóstico recebido com sucesso.',
            'data' => [
                'public_id' => $lead->public_id,
                'status' => $lead->status,
            ],
        ], 201);
    }
}
