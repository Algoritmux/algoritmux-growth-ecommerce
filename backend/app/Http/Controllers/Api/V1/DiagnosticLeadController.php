<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDiagnosticLeadRequest;
use App\Models\DiagnosticLead;
use App\Services\Pipedrive\PipedriveLeadSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Throwable;

class DiagnosticLeadController extends Controller
{
    public function store(StoreDiagnosticLeadRequest $request, PipedriveLeadSyncService $pipedrive): JsonResponse
    {
        $lead = DiagnosticLead::create([
            ...$request->validated(),
            'public_id' => (string) Str::uuid(),
            'status' => 'new',
        ]);

        try {
            $pipedrive->sync($lead);
        } catch (Throwable) {
            $lead->forceFill([
                'pipedrive_sync_status' => DiagnosticLead::PIPEDRIVE_SYNC_FAILED,
                'pipedrive_sync_error' => 'Pipedrive synchronization failed.',
            ])->save();
        }

        return response()->json([
            'message' => 'Lead de diagnóstico recebido com sucesso.',
            'data' => [
                'public_id' => $lead->public_id,
                'status' => $lead->status,
            ],
        ], 201);
    }
}
