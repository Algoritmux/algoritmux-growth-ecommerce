<?php

use App\Http\Controllers\Api\V1\DiagnosticLeadController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('leads/diagnostic', [DiagnosticLeadController::class, 'store'])
        ->middleware('throttle:diagnostic-leads');
});
