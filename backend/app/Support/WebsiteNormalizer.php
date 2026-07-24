<?php

namespace App\Support;

final class WebsiteNormalizer
{
    public static function normalize(mixed $website): ?string
    {
        if (! is_string($website)) {
            return null;
        }

        $website = trim($website);

        if ($website === '') {
            return null;
        }

        if (! preg_match('/^[a-z][a-z0-9+.-]*:/i', $website)) {
            $website = "https://{$website}";
        }

        return $website;
    }

    public static function isValid(?string $website): bool
    {
        if ($website === null) {
            return true;
        }

        $parts = parse_url($website);

        if ($parts === false
            || ! isset($parts['scheme'], $parts['host'])
            || ! in_array(strtolower($parts['scheme']), ['http', 'https'], true)) {
            return false;
        }

        $host = strtolower($parts['host']);

        if ($host === 'localhost' || filter_var($host, FILTER_VALIDATE_IP) !== false) {
            return false;
        }

        if (strlen($host) > 253 || ! str_contains($host, '.')) {
            return false;
        }

        $labels = explode('.', $host);

        if (strlen((string) end($labels)) < 2) {
            return false;
        }

        foreach ($labels as $label) {
            if (! preg_match('/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i', $label)) {
                return false;
            }
        }

        return true;
    }
}
