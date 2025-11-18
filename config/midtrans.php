<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Midtrans Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Midtrans payment gateway integration
    |
    */

    // Midtrans Server Key (from Midtrans Dashboard)
    'server_key' => env('MIDTRANS_SERVER_KEY', 'SB-Mid-server-YOUR_SERVER_KEY'),

    // Midtrans Client Key (from Midtrans Dashboard)  
    'client_key' => env('MIDTRANS_CLIENT_KEY', 'SB-Mid-client-YOUR_CLIENT_KEY'),

    // Environment: true for Production, false for Sandbox
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),

    // Enable sanitization (recommended: true)
    'is_sanitized' => env('MIDTRANS_IS_SANITIZED', true),

    // Enable 3D Secure (recommended: true)
    'is_3ds' => env('MIDTRANS_IS_3DS', true),

    // Snap API URL
    'snap_url' => env('MIDTRANS_IS_PRODUCTION', false) 
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js',

    // Payment notification URL (webhook)
    'notification_url' => env('APP_URL') . '/api/payment/notification',

    // Payment finish URLs
    'finish_url' => env('APP_URL') . '/payment/finish',
    'unfinish_url' => env('APP_URL') . '/payment/unfinish', 
    'error_url' => env('APP_URL') . '/payment/error',

    // Commission settings
    'platform_fee_percentage' => env('PLATFORM_FEE_PERCENTAGE', 10), // 10%
    'event_commission_percentage' => env('EVENT_COMMISSION_PERCENTAGE', 5), // 5%

    // Premium pricing (in IDR)
    'premium_pricing' => [
        'monthly' => env('PREMIUM_MONTHLY_PRICE', 50000), // 50k/month
        'yearly' => env('PREMIUM_YEARLY_PRICE', 500000),  // 500k/year (save 100k)
    ],

    // Minimum transaction amount (in IDR)
    'minimum_amount' => env('MINIMUM_TRANSACTION_AMOUNT', 10000), // 10k

    // Maximum transaction amount (in IDR)  
    'maximum_amount' => env('MAXIMUM_TRANSACTION_AMOUNT', 50000000), // 50 million

    // Payment methods enabled
    'enabled_payments' => [
        'credit_card',
        'bank_transfer',
        'echannel', 
        'bca_va',
        'bni_va',
        'bri_va',
        'other_va',
        'gopay',
        'shopeepay',
        'qris'
    ],

    // Auto-expire payment (in minutes)
    'payment_expiry' => env('PAYMENT_EXPIRY_MINUTES', 1440), // 24 hours
];
