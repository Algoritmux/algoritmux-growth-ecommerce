<?php

use App\Http\Controllers\ArticleSitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/sitemap-articles.xml', ArticleSitemapController::class)
    ->name('sitemap.articles');

Route::get('/', function () {
    return view('welcome');
});
