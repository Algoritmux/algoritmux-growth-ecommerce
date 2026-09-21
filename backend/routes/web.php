<?php

use App\Http\Controllers\ArticleFeedController;
use App\Http\Controllers\ArticleSitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/rss.xml', ArticleFeedController::class)
    ->name('feed.rss');

Route::get('/sitemap-articles.xml', ArticleSitemapController::class)
    ->name('sitemap.articles');

Route::get('/', function () {
    return view('welcome');
});
