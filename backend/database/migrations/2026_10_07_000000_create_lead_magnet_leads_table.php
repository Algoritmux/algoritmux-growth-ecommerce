<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lead_magnet_leads', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->string('name');
            $table->string('email', 254);
            $table->string('lead_magnet', 100);
            $table->string('source_page')->nullable();
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('utm_content')->nullable();
            $table->string('utm_term')->nullable();
            $table->boolean('newsletter_consent')->default(false);
            $table->timestamp('newsletter_consented_at')->nullable();
            $table->string('email_status', 32)->default('pending');
            $table->timestamp('email_sent_at')->nullable();
            $table->string('email_error', 1000)->nullable();
            $table->timestamp('downloaded_at')->nullable();
            $table->string('listmonk_sync_status', 32)->default('not_requested');
            $table->unsignedBigInteger('listmonk_subscriber_id')->nullable()->index();
            $table->timestamp('listmonk_synced_at')->nullable();
            $table->string('listmonk_sync_error', 1000)->nullable();
            $table->timestamp('last_requested_at')->nullable();
            $table->timestamps();

            $table->unique(['email', 'lead_magnet']);
            $table->index(['email_status', 'last_requested_at']);
            $table->index(['listmonk_sync_status', 'newsletter_consent']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lead_magnet_leads');
    }
};
