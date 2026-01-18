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
        'https://rema-cleansable-mirtha.ngrok-free.dev',
        'https://investigatory-shayla-unstalemated.ngrok-free.dev',
        'http://localhost:5173',
        'https://quiz-admin-new.netlify.app',
        'https://quizs-admin.netlify.app',
    ],

    'allowed_origins_patterns' => [
        '#^https://.*\.netlify\.app$#',
        '#^https://.*\.ngrok-free\.dev$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Important: allow credentials so Access-Control-Allow-Credentials is set to true
    'supports_credentials' => true,

];
