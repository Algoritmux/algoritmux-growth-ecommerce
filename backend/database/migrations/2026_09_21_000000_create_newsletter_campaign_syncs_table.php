<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('newsletter_campaign_syncs', function (Blueprint $table) {
            $table->id();
            $table->string('source_guid')->unique();
            $table->string('source_url', 2048);
            $table->string('source_title');
            $table->timestamp('source_published_at');
            $table->string('status', 32)->default('discovered')->index();
            $table->unsignedBigInteger('listmonk_campaign_id')->nullable()->unique();
            $table->unsignedInteger('attempts')->default(0);
            $table->text('last_error')->nullable();
            $table->timestamp('last_attempt_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_campaign_syncs');
    }
};
