<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Xendit API Configuration
    |--------------------------------------------------------------------------
    */

    'secret_key' => env('XENDIT_SECRET_KEY', 'xnd_development_rPvLtDKJjpL8htkBSoB1tjvHh3ln3rQIYTfDwPhitamzlC2224378pakfyv'),
    'public_key' => env('XENDIT_PUBLIC_KEY', 'xnd_public_development_Sku06VoG9vMHNq5qlzYennL2_HoqMlWvJLU8Ant07Mf5heQsWUwyFGbQzDAoWLD8'),

    'is_production' => env('XENDIT_IS_PRODUCTION', false),

    // Xendit API Endpoints
    'api_url' => env('XENDIT_API_URL', 'https://api.xendit.co'),

    // Invoice expiry in hours
    'invoice_expiry' => env('XENDIT_INVOICE_EXPIRY', 24),

    // Success/failure redirect URLs (Frontend React URLs)
    'success_redirect_url' => env('FRONTEND_URL', 'http://localhost:5174') . '/payment/success',
    'failure_redirect_url' => env('FRONTEND_URL', 'http://localhost:5174') . '/payment/failed',

    // Available payment methods
    'enabled_payment_methods' => [
        'bank_transfer',
        'credit_card',
        'ewallet',
        'qris',
        'retail_outlet',
    ],

    // Available banks for VA
    'available_banks' => [
        'BCA' => 'BCA',
        'BNI' => 'BNI',
        'BRI' => 'BRI',
        'MANDIRI' => 'MANDIRI',
        'PERMATA' => 'PERMATA',
    ],

    // Available e-wallets
    'available_ewallets' => [
        'OVO' => 'OVO',
        'DANA' => 'DANA',
        'LINKAJA' => 'LINKAJA',
        'SHOPEEPAY' => 'SHOPEEPAY',
    ],
];
