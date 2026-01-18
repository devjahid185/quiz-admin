<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\DeviceToken;
use App\Events\MessageSent;
use App\Events\MessageRead;
use App\Events\TypingIndicator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    /**
     * Get all conversations for a user
     */
    public function getConversations(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $conversations = DB::table('conversations')
            ->where(function($query) use ($user) {
                $query->where('user1_id', $user->id)
                      ->orWhere('user2_id', $user->id);
            })
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(function($conv) use ($user) {
                $otherUserId = $conv->user1_id == $user->id ? $conv->user2_id : $conv->user1_id;
                $otherUser = User::find($otherUserId);

                $lastMessage = DB::table('messages')
                    ->where('conversation_id', $conv->id)
                    ->orderBy('created_at', 'desc')
                    ->first();

                $unreadCount = DB::table('messages')
                    ->where('conversation_id', $conv->id)
                    ->where('receiver_id', $user->id)
                    ->where('is_read', false)
                    ->count();

                return [
                    'conversation_id' => $conv->id,
                    'other_user' => [
                        'id' => $otherUser->id,
                        'name' => $otherUser->name,
                        'email' => $otherUser->email,
                        'image' => $otherUser->profile_image_url,
                        'is_online' => $otherUser->is_online ?? false,
                    ],
                    'last_message' => $lastMessage ? [
                        'id' => $lastMessage->id,
                        'message' => $lastMessage->message,
                        'type' => $lastMessage->type,
                        'created_at' => $lastMessage->created_at,
                    ] : null,
                    'unread_count' => $unreadCount,
                    'last_message_at' => $conv->last_message_at,
                ];
            });

        return response()->json([
            'success' => true,
            'conversations' => $conversations
        ]);
    }

    /**
     * Get or create conversation between two users
     */
    public function getOrCreateConversation(Request $request)
    {
        $request->validate([
            'user_email' => 'required|email',
            'other_user_id' => 'required|integer|exists:users,id'
        ]);

        $user = User::where('email', $request->user_email)->first();
        $otherUser = User::find($request->other_user_id);

        if (!$user || !$otherUser) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        if ($user->id == $otherUser->id) {
            return response()->json(['success' => false, 'message' => 'Cannot create conversation with yourself'], 400);
        }

        $conversation = DB::table('conversations')
            ->where(function($query) use ($user, $otherUser) {
                $query->where(function($q) use ($user, $otherUser) {
                    $q->where('user1_id', $user->id)
                      ->where('user2_id', $otherUser->id);
                })->orWhere(function($q) use ($user, $otherUser) {
                    $q->where('user1_id', $otherUser->id)
                      ->where('user2_id', $user->id);
                });
            })
            ->first();

        if (!$conversation) {
            $conversationId = DB::table('conversations')->insertGetId([
                'user1_id' => min($user->id, $otherUser->id),
                'user2_id' => max($user->id, $otherUser->id),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $conversation = (object)['id' => $conversationId];
        }

        return response()->json([
            'success' => true,
            'conversation_id' => $conversation->id,
            'other_user' => [
                'id' => $otherUser->id,
                'name' => $otherUser->name,
                'email' => $otherUser->email,
                'image' => $otherUser->profile_image_url,
                'is_online' => $otherUser->is_online ?? false,
            ]
        ]);
    }

    /**
     * Get messages for a conversation
     */
    public function getMessages(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'conversation_id' => 'required|integer',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $conversation = DB::table('conversations')
            ->where('id', $request->conversation_id)
            ->where(function($query) use ($user) {
                $query->where('user1_id', $user->id)
                      ->orWhere('user2_id', $user->id);
            })
            ->first();

        if (!$conversation) {
            return response()->json(['success' => false, 'message' => 'Conversation not found'], 404);
        }

        $perPage = $request->input('per_page', 20);
        $page = $request->input('page', 1);

        $messages = DB::table('messages')
            ->where('conversation_id', $request->conversation_id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        $formattedMessages = $messages->getCollection()->map(function($msg) {
            return [
                'id' => $msg->id,
                'sender_id' => $msg->sender_id,
                'receiver_id' => $msg->receiver_id,
                'message' => $msg->message,
                'type' => $msg->type,
                'media_url' => $msg->media_url ? asset('storage/' . $msg->media_url) : null,
                'media_thumbnail' => $msg->media_thumbnail ? asset('storage/' . $msg->media_thumbnail) : null,
                'voice_duration' => $msg->voice_duration,
                'file_name' => $msg->file_name,
                'file_size' => $msg->file_size,
                'is_read' => $msg->is_read,
                'read_at' => $msg->read_at,
                'created_at' => $msg->created_at,
            ];
        })->reverse()->values();

        return response()->json([
            'success' => true,
            'messages' => $formattedMessages,
            'pagination' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
            ]
        ]);
    }

    /**
     * Send a text message
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'conversation_id' => 'required|integer',
            'message' => 'required|string|max:5000',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $conversation = DB::table('conversations')
            ->where('id', $request->conversation_id)
            ->first();

        if (!$conversation) {
            return response()->json(['success' => false, 'message' => 'Conversation not found'], 404);
        }

        // ✅ Determine receiver (Ensure logic is correct)
        // If I am user1, receiver is user2. If I am user2, receiver is user1.
        $receiverId = $conversation->user1_id == $user->id ? $conversation->user2_id : $conversation->user1_id;

        Log::info("Sending Message: Sender ID: {$user->id}, Receiver ID: {$receiverId}");

        $messageId = DB::table('messages')->insertGetId([
            'conversation_id' => $request->conversation_id,
            'sender_id' => $user->id,
            'receiver_id' => $receiverId,
            'message' => $request->message,
            'type' => 'text',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('conversations')
            ->where('id', $request->conversation_id)
            ->update(['last_message_at' => now()]);

        $message = DB::table('messages')
            ->where('id', $messageId)
            ->first();

        $messageData = [
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'sender_id' => $message->sender_id,
            'receiver_id' => $message->receiver_id,
            'message' => $message->message,
            'type' => $message->type,
            'is_read' => $message->is_read,
            'created_at' => $message->created_at,
            'sender' => [
                'id' => $user->id,
                'name' => $user->name,
                'image' => $user->profile_image_url,
            ]
        ];

        // Broadcast via WebSocket
        broadcast(new MessageSent($messageData, $receiverId));

        // ✅ Send push notification to receiver ONLY
        Log::info("Initiating Notification for Receiver ID: {$receiverId}");
        $this->sendChatNotification($receiverId, $user, $messageData);

        return response()->json([
            'success' => true,
            'message' => $messageData
        ]);
    }

    /**
     * Upload and send media message
     */
    public function sendMediaMessage(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'conversation_id' => 'required|integer',
            'type' => 'required|in:image,voice,file',
            'file' => 'required|file',
            'message' => 'nullable|string|max:1000',
            'voice_duration' => 'nullable|integer|min:0',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $conversation = DB::table('conversations')
            ->where('id', $request->conversation_id)
            ->first();

        if (!$conversation) {
            return response()->json(['success' => false, 'message' => 'Conversation not found'], 404);
        }

        // ✅ Determine receiver
        $receiverId = $conversation->user1_id == $user->id ? $conversation->user2_id : $conversation->user1_id;

        Log::info("Sending Media: Sender ID: {$user->id}, Receiver ID: {$receiverId}");

        $file = $request->file('file');
        $type = $request->type;
        $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $storedPath = $file->storeAs('chat/' . $type, $fileName, 'public');

        $thumbnailPath = null;
        if ($type === 'image') {
            try {
                $thumbnailPath = $this->generateThumbnail($storedPath, $file);
            } catch (\Exception $e) {
                // Ignore thumbnail error
            }
        }

        $messageId = DB::table('messages')->insertGetId([
            'conversation_id' => $request->conversation_id,
            'sender_id' => $user->id,
            'receiver_id' => $receiverId,
            'message' => $request->message,
            'type' => $type,
            'media_url' => $storedPath,
            'media_thumbnail' => $thumbnailPath,
            'voice_duration' => $request->voice_duration,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('conversations')
            ->where('id', $request->conversation_id)
            ->update(['last_message_at' => now()]);

        $message = DB::table('messages')->where('id', $messageId)->first();

        $messageData = [
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'sender_id' => $message->sender_id,
            'receiver_id' => $message->receiver_id,
            'message' => $message->message,
            'type' => $message->type,
            'media_url' => asset('storage/' . $message->media_url),
            'media_thumbnail' => $message->media_thumbnail ? asset('storage/' . $message->media_thumbnail) : null,
            'voice_duration' => $message->voice_duration,
            'file_name' => $message->file_name,
            'file_size' => $message->file_size,
            'is_read' => $message->is_read,
            'created_at' => $message->created_at,
            'sender' => [
                'id' => $user->id,
                'name' => $user->name,
                'image' => $user->profile_image_url,
            ]
        ];

        broadcast(new MessageSent($messageData, $receiverId));

        // ✅ Send push notification to receiver ONLY
        Log::info("Initiating Media Notification for Receiver ID: {$receiverId}");
        $this->sendChatNotification($receiverId, $user, $messageData);

        return response()->json([
            'success' => true,
            'message' => $messageData
        ]);
    }

    public function markAsRead(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'conversation_id' => 'required|integer',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $updated = DB::table('messages')
            ->where('conversation_id', $request->conversation_id)
            ->where('receiver_id', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        $conversation = DB::table('conversations')->where('id', $request->conversation_id)->first();
        $otherUserId = $conversation->user1_id == $user->id ? $conversation->user2_id : $conversation->user1_id;

        broadcast(new MessageRead($request->conversation_id, $user->id, $otherUserId));

        return response()->json([
            'success' => true,
            'message' => 'Messages marked as read',
            'updated_count' => $updated
        ]);
    }

    public function sendTypingIndicator(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'conversation_id' => 'required|integer',
            'is_typing' => 'required|boolean',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $conversation = DB::table('conversations')->where('id', $request->conversation_id)->first();

        if (!$conversation) {
            return response()->json(['success' => false, 'message' => 'Conversation not found'], 404);
        }

        $receiverId = $conversation->user1_id == $user->id ? $conversation->user2_id : $conversation->user1_id;

        broadcast(new TypingIndicator($request->conversation_id, $user->id, $receiverId, $request->is_typing));

        return response()->json(['success' => true]);
    }

    private function generateThumbnail($imagePath, $file)
    {
        $thumbnailDir = 'chat/thumbnails';
        if (!Storage::disk('public')->exists($thumbnailDir)) {
            Storage::disk('public')->makeDirectory($thumbnailDir);
        }

        $thumbnailName = 'thumb_' . basename($imagePath);
        $thumbnailPath = $thumbnailDir . '/' . $thumbnailName;

        if (extension_loaded('gd')) {
            $image = imagecreatefromstring(file_get_contents($file->getRealPath()));
            $width = imagesx($image);
            $height = imagesy($image);
            
            $thumbWidth = 200;
            $thumbHeight = 200;
            
            $thumbnail = imagecreatetruecolor($thumbWidth, $thumbHeight);
            imagecopyresampled($thumbnail, $image, 0, 0, 0, 0, $thumbWidth, $thumbHeight, $width, $height);
            
            $fullPath = Storage::disk('public')->path($thumbnailPath);
            imagejpeg($thumbnail, $fullPath, 80);
            imagedestroy($image);
            imagedestroy($thumbnail);
            
            return $thumbnailPath;
        }

        return null;
    }

    public function getAllUsersForChat(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $currentUser = User::where('email', $request->email)->first();

        if (!$currentUser) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $query = User::where('id', '!=', $currentUser->id)
            ->where('blocked', false)
            ->orderBy('name', 'asc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhere('phone_number', 'like', "%$search%");
            });
        }

        $perPage = $request->input('per_page', 50);
        $users = $query->paginate($perPage);

        $formattedUsers = $users->getCollection()->map(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'image' => $user->profile_image_url,
                'is_online' => $user->is_online ?? false,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedUsers,
            'pagination' => [
                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
            ]
        ]);
    }

    // ==========================================
    // ✅ NOTIFICATION SECTION (Fully Updated)
    // ==========================================

    /**
     * Send push notification for chat messages
     */
    private function sendChatNotification($receiverId, $sender, $messageData)
    {
        Log::info("--- START: Sending Chat Notification ---");
        Log::info("Target Receiver ID: {$receiverId}");

        try {
            // Check for tokens
            $tokens = DeviceToken::where('user_id', $receiverId)->pluck('token')->toArray();
            
            if (empty($tokens)) {
                Log::warning("No device tokens found for User ID: {$receiverId}");
                Log::info("--- END: Sending Chat Notification (Skipped) ---");
                return;
            }

            Log::info("Found " . count($tokens) . " tokens for User ID: {$receiverId}");

            // Prepare content
            $senderName = $sender->name ?? 'Someone';
            $messageText = $messageData['message'] ?? '';
            $messageType = $messageData['type'] ?? 'text';

            $title = $senderName;
            $body = '';
            $imageUrl = null;

            switch ($messageType) {
                case 'text':
                    $body = $messageText;
                    break;
                case 'image':
                    $body = '📷 Sent an image';
                    $imageUrl = isset($messageData['media_url']) ? $messageData['media_url'] : null;
                    if ($messageText) $body = $messageText;
                    break;
                case 'voice':
                    $body = '🎤 Sent a voice message';
                    break;
                case 'file':
                    $body = '📎 Sent a file';
                    break;
                default:
                    $body = 'Sent a message';
            }

            $accessToken = $this->getFcmAccessToken();
            $projectId = $this->getFcmProjectId();

            if (!$accessToken || !$projectId) {
                Log::error("FCM Configuration missing. AccessToken: " . ($accessToken ? 'OK' : 'MISSING') . ", ProjectID: " . ($projectId ? 'OK' : 'MISSING'));
                return;
            }

            foreach ($tokens as $token) {
                Log::info("Sending to token: " . substr($token, 0, 10) . "...");
                
                $response = $this->sendFcmV1Notification($accessToken, $projectId, $token, $title, $body, $imageUrl, [
                    'type' => 'chat_message',
                    'conversation_id' => (string)$messageData['conversation_id'],
                    'sender_id' => (string)$messageData['sender_id'],
                    'message_id' => (string)$messageData['id'],
                    
                    // 🔴 ভুল ছিল: 'message_type' => $messageType, 
                    // ✅ সঠিক (নাম পরিবর্তন করা হয়েছে):
                    'msg_type' => $messageType, 
                ]);

                // Log FCM Response
                if($response) {
                    Log::info("FCM Response Status: " . $response->status());
                    if ($response->failed()) {
                        Log::error("FCM Failed: " . $response->body());
                    } else {
                        Log::info("FCM Success: " . $response->body());
                    }
                }
            }

        } catch (\Exception $e) {
            Log::error('Chat notification exception: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
        }
        
        Log::info("--- END: Sending Chat Notification ---");
    }

    private function getFcmAccessToken()
    {
        try {
            $serviceAccountPath = env('FCM_SERVICE_ACCOUNT_PATH', storage_path('app/firebase-service-account.json'));
            
            if (!file_exists($serviceAccountPath)) {
                Log::error("Firebase service account file NOT FOUND at: $serviceAccountPath");
                return null;
            }

            $serviceAccount = json_decode(file_get_contents($serviceAccountPath), true);
            
            if (!isset($serviceAccount['private_key']) || !isset($serviceAccount['client_email'])) {
                Log::error("Firebase JSON file is invalid or missing private_key/client_email");
                return null;
            }

            $now = time();
            $jwt = $this->createFcmJWT($serviceAccount, $now);

            $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt,
            ]);

            $data = json_decode($response->body(), true);
            if (isset($data['access_token'])) {
                return $data['access_token'];
            }

            Log::error("Failed to get Access Token from Google: " . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('FCM Access Token Exception: ' . $e->getMessage());
            return null;
        }
    }

    private function getFcmProjectId()
    {
        try {
            $serviceAccountPath = env('FCM_SERVICE_ACCOUNT_PATH', storage_path('app/firebase-service-account.json'));
            
            if (!file_exists($serviceAccountPath)) {
                return null;
            }

            $serviceAccount = json_decode(file_get_contents($serviceAccountPath), true);
            return $serviceAccount['project_id'] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    private function createFcmJWT($serviceAccount, $now)
    {
        $header = ['alg' => 'RS256', 'typ' => 'JWT'];
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
        $privateKey = $serviceAccount['private_key'];
        
        // Ensure OpenSSL can read the key
        if (!openssl_sign($headerEncoded . '.' . $claimEncoded, $signature, $privateKey, OPENSSL_ALGO_SHA256)) {
            Log::error("OpenSSL Sign Failed: " . openssl_error_string());
            return null;
        }

        return $headerEncoded . '.' . $claimEncoded . '.' . $this->base64UrlEncode($signature);
    }

    private function base64UrlEncode($data)
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function sendFcmV1Notification($accessToken, $projectId, $token, $title, $body, $image = null, $customData = [])
    {
        try {
            $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";

            $messagePayload = [
                'message' => [
                    'token' => $token,
                    'notification' => [
                        'title' => $title,
                        'body' => $body,
                    ],
                    'data' => array_merge([
                        'type' => 'chat_message',
                        'title' => $title,
                        'body' => $body,
                    ], array_map('strval', $customData)),
                    'android' => [
                        'priority' => 'high',
                        'notification' => [
                            'sound' => 'default',
                            'channel_id' => 'high_importance_channel'
                        ]
                    ],
                    'apns' => [
                        'payload' => [
                            'aps' => [
                                'sound' => 'default',
                                'content-available' => 1
                            ]
                        ],
                        'headers' => [
                            'apns-priority' => '10',
                        ],
                    ],
                ]
            ];

            if ($image) {
                $messagePayload['message']['notification']['image'] = $image;
                $messagePayload['message']['data']['image'] = $image;
            }

            return Http::withToken($accessToken)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($url, $messagePayload);

        } catch (\Exception $e) {
            Log::error('FCM V1 Send Error: ' . $e->getMessage());
            return null;
        }
    }
}