<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\DeviceToken;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AdminNotificationApiController extends Controller
{
    /**
     * Get OAuth2 Access Token from Service Account
     */
    private function getAccessToken()
    {
        try {
            // Get service account JSON path from .env
            $serviceAccountPath = env('FCM_SERVICE_ACCOUNT_PATH', storage_path('app/firebase-service-account.json'));
            
            if (!file_exists($serviceAccountPath)) {
                throw new \Exception('Firebase Service Account JSON file not found at: ' . $serviceAccountPath);
            }

            $serviceAccount = json_decode(file_get_contents($serviceAccountPath), true);
            
            if (!isset($serviceAccount['private_key']) || !isset($serviceAccount['client_email'])) {
                throw new \Exception('Invalid service account JSON format');
            }

            // Create JWT
            $now = time();
            $jwt = $this->createJWT($serviceAccount, $now);

            // Exchange JWT for access token
            $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['access_token'];
            } else {
                Log::error('FCM OAuth Error: ' . $response->body());
                throw new \Exception('Failed to get access token: ' . $response->status());
            }
        } catch (\Exception $e) {
            Log::error('FCM Access Token Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create JWT for OAuth2
     */
    private function createJWT($serviceAccount, $now)
    {
        $header = [
            'alg' => 'RS256',
            'typ' => 'JWT',
        ];

        $claim = [
            'iss' => $serviceAccount['client_email'],
            'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
            'aud' => 'https://oauth2.googleapis.com/token',
            'exp' => $now + 3600,
            'iat' => $now,
        ];

        $headerEncoded = $this->base64UrlEncode(json_encode($header));
        $claimEncoded = $this->base64UrlEncode(json_encode($claim));

        $signature = '';
        openssl_sign(
            $headerEncoded . '.' . $claimEncoded,
            $signature,
            $serviceAccount['private_key'],
            OPENSSL_ALGO_SHA256
        );

        $signatureEncoded = $this->base64UrlEncode($signature);

        return $headerEncoded . '.' . $claimEncoded . '.' . $signatureEncoded;
    }

    /**
     * Base64 URL Encode
     */
    private function base64UrlEncode($data)
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Get Project ID from Service Account
     */
    private function getProjectId()
    {
        $serviceAccountPath = env('FCM_SERVICE_ACCOUNT_PATH', storage_path('app/firebase-service-account.json'));
        
        if (!file_exists($serviceAccountPath)) {
            throw new \Exception('Firebase Service Account JSON file not found');
        }

        $serviceAccount = json_decode(file_get_contents($serviceAccountPath), true);
        
        // Extract project_id from service account
        if (isset($serviceAccount['project_id'])) {
            return $serviceAccount['project_id'];
        }

        // Alternative: extract from client_email (format: service-account@project-id.iam.gserviceaccount.com)
        if (isset($serviceAccount['client_email'])) {
            $email = $serviceAccount['client_email'];
            if (preg_match('/@([^.]+)\.iam\.gserviceaccount\.com$/', $email, $matches)) {
                return $matches[1];
            }
        }

        // Last resort: use env variable
        return env('FCM_PROJECT_ID');
    }

    /**
     * Send notification to specific user(s) using FCM HTTP v1 API
     */
    public function sendNotification(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'image' => 'nullable|url|max:500',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'required|integer|exists:users,id',
        ]);

        $title = $request->title;
        $body = $request->body;
        $image = $request->image;
        $userIds = $request->user_ids;

        // Get all device tokens for the selected users
        $tokens = DeviceToken::whereIn('user_id', $userIds)
            ->pluck('token')
            ->toArray();

        if (empty($tokens)) {
            return response()->json([
                'success' => false,
                'message' => 'No device tokens found for selected users'
            ], 404);
        }

        // Get access token
        try {
            $accessToken = $this->getAccessToken();
            $projectId = $this->getProjectId();
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'FCM Configuration Error: ' . $e->getMessage()
            ], 500);
        }

        // Send notifications
        $successCount = 0;
        $failureCount = 0;
        $errors = [];

        foreach ($tokens as $token) {
            $response = $this->sendFcmV1Notification($accessToken, $projectId, $token, $title, $body, $image);
            
            if ($response['success']) {
                $successCount++;
            } else {
                $failureCount++;
                $errors[] = "Token {$token}: {$response['error']}";
                
                // Remove invalid tokens
                if (strpos($response['error'], 'NOT_FOUND') !== false || 
                    strpos($response['error'], 'INVALID_ARGUMENT') !== false) {
                    DeviceToken::where('token', $token)->delete();
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Notification sent to $successCount device(s). $failureCount failed.",
            'stats' => [
                'total_tokens' => count($tokens),
                'success_count' => $successCount,
                'failure_count' => $failureCount,
            ],
            'errors' => $errors
        ]);
    }

    /**
     * Send notification to all users
     */
    public function sendToAll(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'image' => 'nullable|url|max:500',
        ]);

        // Get all active users (not blocked)
        $userIds = User::where('blocked', false)->pluck('id')->toArray();

        if (empty($userIds)) {
            return response()->json([
                'success' => false,
                'message' => 'No active users found'
            ], 404);
        }

        // Use the same sendNotification logic
        $request->merge(['user_ids' => $userIds]);
        return $this->sendNotification($request);
    }

    /**
     * Get users with device tokens (for selection in admin panel)
     */
    public function getUsersWithTokens(Request $request)
    {
        $query = User::where('blocked', false)
            ->whereHas('deviceTokens')
            ->withCount('deviceTokens')
            ->orderBy('name', 'asc');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        $perPage = $request->input('per_page', 20);
        $users = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'pagination' => [
                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
            ]
        ]);
    }

    /**
     * Send FCM notification using HTTP v1 API
     */
    private function sendFcmV1Notification($accessToken, $projectId, $token, $title, $body, $image = null)
    {
        try {
            $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";

            // Build message payload
            $message = [
                'message' => [
                    'token' => $token,
                    'notification' => [
                        'title' => $title,
                        'body' => $body,
                    ],
                    'data' => [
                        'type' => 'manual_notification',
                        'title' => $title,
                        'body' => $body,
                    ],
                    'android' => [
                        'priority' => 'high',
                    ],
                    'apns' => [
                        'headers' => [
                            'apns-priority' => '10',
                        ],
                    ],
                ]
            ];

            // Add image if provided
            if ($image) {
                $message['message']['notification']['image'] = $image;
                $message['message']['data']['image'] = $image;
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'Content-Type' => 'application/json',
            ])->post($url, $message);

            if ($response->successful()) {
                return [
                    'success' => true,
                ];
            } else {
                $errorBody = $response->json();
                $errorMessage = $errorBody['error']['message'] ?? 'Unknown error';
                
                Log::error('FCM v1 Error: ' . json_encode($errorBody));
                
                return [
                    'success' => false,
                    'error' => $errorMessage
                ];
            }
        } catch (\Exception $e) {
            Log::error('FCM v1 Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
