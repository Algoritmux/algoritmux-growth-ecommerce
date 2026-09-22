<?php

namespace App\Console\Commands;

use App\Models\NewsletterCampaignSync;
use App\Services\Listmonk\ListmonkClient;
use App\Services\Newsletter\ArticleFeedReader;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Throwable;

class SyncArticleFeedCampaigns extends Command
{
    protected $signature = 'newsletter:sync-rss
        {--dry-run : Validate the feed and show campaigns without writing or calling Listmonk}
        {--bootstrap : Mark current feed items as already processed without creating campaigns}
        {--limit=50 : Maximum number of feed items to process}';

    protected $description = 'Create draft Listmonk campaigns for new articles in the RSS feed.';

    public function handle(ArticleFeedReader $feedReader, ListmonkClient $listmonk): int
    {
        if ($this->option('dry-run') && $this->option('bootstrap')) {
            $this->error('The --dry-run and --bootstrap options cannot be used together.');

            return self::FAILURE;
        }

        $limit = filter_var($this->option('limit'), FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1, 'max_range' => 50],
        ]);

        if ($limit === false) {
            $this->error('The --limit option must be an integer between 1 and 50.');

            return self::FAILURE;
        }

        if (! $this->option('dry-run') && ! $this->option('bootstrap')) {
            if (! config('services.listmonk.enabled')) {
                $this->warn('Listmonk synchronization is disabled.');

                return self::SUCCESS;
            }

            if (! $listmonk->isConfigured()) {
                $this->error('Listmonk configuration is incomplete.');

                return self::FAILURE;
            }
        }

        try {
            $items = $feedReader->read((int) $limit);
        } catch (Throwable $exception) {
            $this->error($this->safeError($exception));

            return self::FAILURE;
        }

        usort(
            $items,
            fn (array $left, array $right): int => $left['published_at']->getTimestamp()
                <=> $right['published_at']->getTimestamp(),
        );

        if ($this->option('dry-run')) {
            return $this->dryRun($items);
        }

        if ($this->option('bootstrap')) {
            return $this->bootstrap($items);
        }

        return $this->synchronize($items, $listmonk);
    }

    /**
     * @param  list<array<string, mixed>>  $items
     */
    private function dryRun(array $items): int
    {
        $pending = 0;

        foreach ($items as $item) {
            $status = NewsletterCampaignSync::query()
                ->where('source_guid', $item['guid'])
                ->value('status');

            if (in_array($status, [
                NewsletterCampaignSync::STATUS_CREATED,
                NewsletterCampaignSync::STATUS_BASELINED,
            ], true)) {
                continue;
            }

            $pending++;
            $this->line("Would create draft: {$item['title']} ({$item['guid']})");
        }

        $this->info("Dry run complete: drafts={$pending}.");

        return self::SUCCESS;
    }

    /**
     * @param  list<array<string, mixed>>  $items
     */
    private function bootstrap(array $items): int
    {
        $baselined = 0;

        foreach ($items as $item) {
            $sync = NewsletterCampaignSync::query()->firstOrNew([
                'source_guid' => $item['guid'],
            ]);

            if ($sync->exists && $sync->status === NewsletterCampaignSync::STATUS_CREATED) {
                continue;
            }

            $sync->forceFill([
                ...$this->sourceAttributes($item),
                'status' => NewsletterCampaignSync::STATUS_BASELINED,
                'last_error' => null,
                'processed_at' => now(),
            ])->save();
            $baselined++;
        }

        $this->info("Bootstrap complete: baselined={$baselined}.");

        return self::SUCCESS;
    }

    /**
     * @param  list<array<string, mixed>>  $items
     */
    private function synchronize(array $items, ListmonkClient $listmonk): int
    {
        $created = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($items as $item) {
            $sync = null;

            try {
                $sync = NewsletterCampaignSync::query()->firstOrCreate(
                    ['source_guid' => $item['guid']],
                    [
                        ...$this->sourceAttributes($item),
                        'status' => NewsletterCampaignSync::STATUS_DISCOVERED,
                    ],
                );

                if (in_array($sync->status, [
                    NewsletterCampaignSync::STATUS_CREATED,
                    NewsletterCampaignSync::STATUS_BASELINED,
                ], true)) {
                    $skipped++;

                    continue;
                }

                $sync->forceFill([
                    ...$this->sourceAttributes($item),
                    'status' => NewsletterCampaignSync::STATUS_PROCESSING,
                    'attempts' => $sync->attempts + 1,
                    'last_error' => null,
                    'last_attempt_at' => now(),
                ])->save();

                $campaignId = $listmonk->findCampaignIdByGuid($item['guid']);

                if ($campaignId === null) {
                    $html = view('newsletter.article-campaign', [
                        'imageUrl' => $item['image_url'],
                        'title' => $item['title'],
                        'summary' => $item['description'],
                        'link' => $item['link'],
                    ])->render();
                    $campaignId = $listmonk->createDraftCampaign($item, $html);
                }

                $sync->forceFill([
                    'status' => NewsletterCampaignSync::STATUS_CREATED,
                    'listmonk_campaign_id' => $campaignId,
                    'last_error' => null,
                    'processed_at' => now(),
                ])->save();

                $created++;
                $this->info("Draft ready: {$item['title']} (campaign {$campaignId}).");
            } catch (Throwable $exception) {
                $failed++;

                if ($sync !== null) {
                    $sync->forceFill([
                        'status' => NewsletterCampaignSync::STATUS_FAILED,
                        'last_error' => $this->safeError($exception),
                    ])->save();
                }

                $this->error("Failed: {$item['guid']} - {$this->safeError($exception)}");
            }
        }

        $this->info("Newsletter sync complete: created={$created} skipped={$skipped} failed={$failed}.");

        return $failed === 0 ? self::SUCCESS : self::FAILURE;
    }

    /**
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>
     */
    private function sourceAttributes(array $item): array
    {
        return [
            'source_url' => $item['link'],
            'source_title' => Str::limit($item['title'], 255, ''),
            'source_published_at' => $item['published_at'],
        ];
    }

    private function safeError(Throwable $exception): string
    {
        $message = strip_tags($exception->getMessage());
        $message = preg_replace('/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/', '[redacted-email]', $message) ?? '';

        return Str::limit(trim($message) ?: 'Newsletter synchronization failed.', 1000, '');
    }
}
