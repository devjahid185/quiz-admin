<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ForceCors
{
    public function handle(Request $request, Closure $next)
    {
        $origin = $request->header('Origin');
        
        // আপনার অনুমোদিত ডোমেইনগুলো এখানে দিন
        $allowedOrigins = [
            'https://libratory-vonda-impulsive.ngrok-free.dev', 
            'http://localhost:5173',
            // ভবিষ্যতে ডোমেইন পাল্টালে এখানে এড করবেন
        ];

        // যদি রিকোয়েস্টের অরিজিন আমাদের লিস্টে থাকে
        if (in_array($origin, $allowedOrigins)) {
            
            // headers তৈরি করি
            $headers = [
                'Access-Control-Allow-Origin' => $origin,
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With, X-XSRF-TOKEN',
                'Access-Control-Allow-Credentials' => 'true',
            ];

            // যদি এটি Preflight (OPTIONS) রিকোয়েস্ট হয়, তবে সরাসরি রেসপন্স রিটার্ন করুন
            if ($request->isMethod('OPTIONS')) {
                return response()->json('OK', 200, $headers);
            }

            // সাধারণ রিকোয়েস্টের রেসপন্সে হেডার যোগ করুন
            $response = $next($request);
            foreach ($headers as $key => $value) {
                $response->headers->set($key, $value);
            }
            return $response;
        }

        return $next($request);
    }
}