<?php

namespace App\Http\Controllers;

use App\Models\LeadMagnetLead;
use Illuminate\Contracts\Filesystem\FileNotFoundException;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LeadMagnetDownloadController extends Controller
{
    /**
     * @throws FileNotFoundException
     */
    public function __invoke(string $publicId): Response|BinaryFileResponse|StreamedResponse
    {
        $lead = LeadMagnetLead::query()->where('public_id', $publicId)->firstOrFail();
        $magnet = config("lead-magnets.items.{$lead->lead_magnet}");

        abort_unless(is_array($magnet), 404);

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('local');
        $path = (string) $magnet['storage_path'];

        abort_unless($disk->exists($path), 404);

        if ($lead->downloaded_at === null) {
            $lead->forceFill(['downloaded_at' => now()])->save();
        }

        return $disk->download(
            $path,
            (string) $magnet['download_filename'],
            ['Content-Type' => 'application/pdf'],
        );
    }
}
