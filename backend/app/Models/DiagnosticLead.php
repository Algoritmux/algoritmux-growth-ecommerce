<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiagnosticLead extends Model
{
    protected $fillable = [
        'public_id',
        'name',
        'whatsapp',
        'email',
        'company_name',
        'website',
        'revenue_range',
        'source_page',
        'status',
    ];
}
