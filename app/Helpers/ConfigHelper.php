<?php

namespace App\Helpers;

use App\Models\Setting;
use Illuminate\Support\Facades\Config;

class ConfigHelper
{
    /**
     * Update mail configuration from database settings
     */
    public static function updateMailConfig()
    {
        try {
            $smtpHost = Setting::where('key', 'smtp_host')->value('value');
            $smtpPort = Setting::where('key', 'smtp_port')->value('value');
            $smtpUsername = Setting::where('key', 'smtp_username')->value('value');
            $smtpPassword = Setting::where('key', 'smtp_password')->value('value');
            $fromEmail = Setting::where('key', 'from_email')->value('value');
            $fromName = Setting::where('key', 'from_name')->value('value');

            if ($smtpHost) {
                Config::set('mail.mailers.smtp.host', $smtpHost);
            }
            if ($smtpPort) {
                Config::set('mail.mailers.smtp.port', (int) $smtpPort);
            }
            if ($smtpUsername) {
                Config::set('mail.mailers.smtp.username', $smtpUsername);
            }
            if ($smtpPassword) {
                Config::set('mail.mailers.smtp.password', $smtpPassword);
            }
            if ($fromEmail) {
                Config::set('mail.from.address', $fromEmail);
            }
            if ($fromName) {
                Config::set('mail.from.name', $fromName);
            }
        } catch (\Exception $e) {
            // Log error but don't break the application
            \Log::warning('Failed to update mail config from database: ' . $e->getMessage());
        }
    }

    /**
     * Get platform settings
     */
    public static function getPlatformSettings()
    {
        return [
            'name' => Setting::where('key', 'platform_name')->value('value') ?? 'Komuji',
            'description' => Setting::where('key', 'platform_description')->value('value') ?? 'Platform Event Management Terpercaya',
            'support_email' => Setting::where('key', 'support_email')->value('value') ?? 'support@komuji.com',
            'support_phone' => Setting::where('key', 'support_phone')->value('value') ?? '+62-21-1234-5678',
            'commission_rate' => Setting::where('key', 'commission_rate')->value('value') ?? 5,
        ];
    }

    /**
     * Get security settings
     */
    public static function getSecuritySettings()
    {
        return [
            'session_timeout' => Setting::where('key', 'session_timeout')->value('value') ?? 120,
            'max_login_attempts' => Setting::where('key', 'max_login_attempts')->value('value') ?? 5,
            'password_min_length' => Setting::where('key', 'password_min_length')->value('value') ?? 8,
            'require_email_verification' => Setting::where('key', 'require_email_verification')->value('value') ?? true,
        ];
    }

    /**
     * Get plan settings
     */
    public static function getPlanSettings()
    {
        return [
            'trial_duration_days' => Setting::where('key', 'trial_duration_days')->value('value') ?? 60,
            'free_max_active_events' => Setting::where('key', 'free_max_active_events')->value('value') ?? 1,
            'premium_max_active_events' => Setting::where('key', 'premium_max_active_events')->value('value') ?? 999,
            'auto_approve_panitia' => Setting::where('key', 'auto_approve_panitia')->value('value') ?? false,
            'auto_approve_events' => Setting::where('key', 'auto_approve_events')->value('value') ?? false,
        ];
    }
}
