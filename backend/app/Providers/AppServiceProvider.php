<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('diagnostic-leads', static fn (Request $request) => Limit::perMinute(5)->by($request->ip()));

        RateLimiter::for('lead-magnet-leads', static function (Request $request): array {
            $email = mb_strtolower(trim((string) $request->input('email')));
            $leadMagnet = trim((string) $request->input('lead_magnet'));
            $limits = [
                Limit::perMinute(3)->by('lead-magnet-ip-minute:'.$request->ip()),
                Limit::perDay(20)->by('lead-magnet-ip-day:'.$request->ip()),
            ];

            if ($email !== '' && $leadMagnet !== '') {
                $identity = hash('sha256', $email.'|'.$leadMagnet);
                $limits[] = Limit::perMinutes(5, 1)->by('lead-magnet-email-five-minutes:'.$identity);
                $limits[] = Limit::perDay(3)->by('lead-magnet-email-day:'.$identity);
            }

            return $limits;
        });
    }
}
