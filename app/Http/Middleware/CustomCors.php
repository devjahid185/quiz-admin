<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CustomCors
{
    public function handle(Request $request, Closure $next)
    {
        $origin = $request->header('Origin');
        
        // আপনার Ngrok URL এবং Localhost দুটোই দিন
        $allowedOrigins = [
            'http://localhost:5173',
            'https://libratory-vonda-impulsive.ngrok-free.dev', 
        ];

        // যদি অরিজিন লিস্টে থাকে, তবে সেটা সেট করব, নাহলে যা আছে তাই (বা নাল)
        if (in_array($origin, $allowedOrigins)) {
            $allowOrigin = $origin;
        } else {
            // ফলব্যাক
            $allowOrigin = 'http://localhost:5173';
        }

        $headers = [
            'Access-Control-Allow-Origin' => $allowOrigin,
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With, X-XSRF-TOKEN',
            'Access-Control-Allow-Credentials' => 'true',
        ];

        if ($request->isMethod('OPTIONS')) {
            return response()->json('OK', 200, $headers);
        }

        $response = $next($request);

        foreach ($headers as $key => $value) {
            $response->headers->set($key, $value);
        }

        return $response;
    }
}