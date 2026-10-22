<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('diagnostic_leads', function (Blueprint $table) {
            $table->string('sales_model', 64)->nullable()->after('project_type');
        });
    }

    public function down(): void
    {
        Schema::table('diagnostic_leads', function (Blueprint $table) {
            $table->dropColumn('sales_model');
        });
    }
};
