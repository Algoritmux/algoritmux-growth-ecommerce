<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('diagnostic_leads', function (Blueprint $table) {
            $table->unsignedBigInteger('pipedrive_organization_id')->nullable()->index()->after('status');
            $table->unsignedBigInteger('pipedrive_person_id')->nullable()->index()->after('pipedrive_organization_id');
            $table->unsignedBigInteger('pipedrive_deal_id')->nullable()->unique()->after('pipedrive_person_id');
            $table->enum('pipedrive_sync_status', ['pending', 'syncing', 'synced', 'failed'])->default('pending')->after('pipedrive_deal_id');
            $table->string('pipedrive_sync_error', 255)->nullable()->after('pipedrive_sync_status');
            $table->timestamp('pipedrive_synced_at')->nullable()->after('pipedrive_sync_error');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('diagnostic_leads', function (Blueprint $table) {
            $table->dropUnique(['pipedrive_deal_id']);
            $table->dropIndex(['pipedrive_organization_id']);
            $table->dropIndex(['pipedrive_person_id']);
            $table->dropColumn([
                'pipedrive_organization_id',
                'pipedrive_person_id',
                'pipedrive_deal_id',
                'pipedrive_sync_status',
                'pipedrive_sync_error',
                'pipedrive_synced_at',
            ]);
        });
    }
};
