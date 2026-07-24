<?php

namespace App\Console\Commands;

use App\Models\DiagnosticLead;
use App\Services\Pipedrive\PipedriveLeadSyncService;
use Illuminate\Console\Command;

class SyncPipedriveLeads extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pipedrive:sync-leads {--limit=50 : Maximum number of leads to process}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize pending and failed diagnostic leads with Pipedrive.';

    public function handle(PipedriveLeadSyncService $pipedrive): int
    {
        $limit = filter_var($this->option('limit'), FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1, 'max_range' => 500],
        ]);

        if ($limit === false) {
            $this->error('The --limit option must be an integer between 1 and 500.');

            return self::FAILURE;
        }

        $leads = DiagnosticLead::query()
            ->whereIn('pipedrive_sync_status', [
                DiagnosticLead::PIPEDRIVE_SYNC_PENDING,
                DiagnosticLead::PIPEDRIVE_SYNC_FAILED,
            ])
            ->orderBy('id')
            ->limit($limit)
            ->get();

        $synced = 0;
        $failed = 0;

        foreach ($leads as $lead) {
            if ($pipedrive->sync($lead)) {
                $synced++;
            } else {
                $failed++;
            }
        }

        $this->info(sprintf(
            'Pipedrive sync complete: processed=%d synced=%d failed=%d.',
            $leads->count(),
            $synced,
            $failed,
        ));

        return self::SUCCESS;
    }
}
