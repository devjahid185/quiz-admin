<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | This configuration allows the frontend at http://localhost:5173
    | to make requests with credentials to this backend.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://libratory-vonda-impulsive.ngrok-free.dev', // আপনার ফ্রন্টএন্ড URL
        'http://localhost:5173', // লোকালহোস্টও রাখতে পারেন
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Important: allow credentials so Access-Control-Allow-Credentials is set to true
    'supports_credentials' => true,

];
