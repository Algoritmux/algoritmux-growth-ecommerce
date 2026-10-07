<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadMagnetLeadRequest;
use App\Jobs\SendLeadMagnetEmail;
use App\Jobs\SubscribeLeadMagnetLeadToListmonk;
use App\Models\LeadMagnetLead;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Str;
use Throwable;

class LeadMagnetLeadController extends Controller
{
    public function store(StoreLeadMagnetLeadRequest $request): JsonResponse
    {
        $data = $request->safe()->except('company_website');
        $consented = (bool) ($data['newsletter_consent'] ?? false);
        $lead = LeadMagnetLead::query()->firstOrNew([
            'email' => $data['email'],
            'lead_magnet' => $data['lead_magnet'],
        ]);

        if (! $lead->exists) {
            $lead->public_id = (string) Str::uuid();
            $lead->newsletter_consent = false;
            $lead->listmonk_sync_status = LeadMagnetLead::LISTMONK_NOT_REQUESTED;
        }

        $lead->fill([
            ...$data,
            'newsletter_consent' => $lead->newsletter_consent || $consented,
            'newsletter_consented_at' => $consented
                ? ($lead->newsletter_consented_at ?? now())
                : $lead->newsletter_consented_at,
            'email_status' => LeadMagnetLead::EMAIL_PENDING,
            'email_error' => null,
            'last_requested_at' => now(),
        ]);

        if ($consented && $lead->listmonk_sync_status !== LeadMagnetLead::LISTMONK_SYNCED) {
            $lead->listmonk_sync_status = LeadMagnetLead::LISTMONK_PENDING;
            $lead->listmonk_sync_error = null;
        }

        $lead->save();

        try {
            Bus::dispatchSync(new SendLeadMagnetEmail($lead->fresh()));
        } catch (Throwable) {
            return response()->json([
                'message' => 'Não foi possível enviar o e-book agora. Tente novamente em alguns instantes.',
            ], 503);
        }

        if ($consented) {
            try {
                Bus::dispatchSync(new SubscribeLeadMagnetLeadToListmonk($lead->fresh()));
            } catch (Throwable) {
                // Newsletter synchronization must never block transactional delivery.
            }
        }

        return response()->json([
            'message' => 'E-book enviado. Confira sua caixa de entrada.',
            'data' => [
                'public_id' => $lead->public_id,
                'email_status' => $lead->fresh()->email_status,
            ],
        ], 201);
    }
}
