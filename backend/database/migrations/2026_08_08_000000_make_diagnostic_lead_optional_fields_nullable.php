<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('diagnostic_leads', function (Blueprint $table) {
            $table->string('whatsapp', 20)->nullable()->change();
            $table->string('email', 254)->nullable()->change();
            $table->string('company_name')->nullable()->change();
            $table->string('revenue_range', 32)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('diagnostic_leads', function (Blueprint $table) {
            $table->string('whatsapp', 20)->nullable(false)->change();
            $table->string('email', 254)->nullable(false)->change();
            $table->string('company_name')->nullable(false)->change();
            $table->string('revenue_range', 32)->nullable(false)->change();
        });
    }
};
