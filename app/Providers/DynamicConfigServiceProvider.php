<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Helpers\ConfigHelper;

class DynamicConfigServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Update mail configuration from database on every request
        // Only if we're not in console (artisan commands)
        if (!$this->app->runningInConsole()) {
            try {
                ConfigHelper::updateMailConfig();
            } catch (\Exception $e) {
                // Silently fail to prevent breaking the app during migrations
            }
        }
    }
}
