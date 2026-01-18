# Real-Time Chat System Documentation

## Backend Setup

### 1. Run Migrations
```bash
php artisan migrate
```

### 2. Required Packages (Flutter)
Add these to your `pubspec.yaml`:

```yaml
dependencies:
  image_picker: ^1.0.0
  image_cropper: ^5.0.0
  record: ^5.0.0
  path_provider: ^2.0.0
  web_socket_channel: ^2.4.0
  get: ^4.6.0
  iconsax_flutter: ^1.0.0
```

### 3. API Endpoints

- `POST /api/chat/conversations` - Get all conversations
- `POST /api/chat/conversation/get-or-create` - Get or create conversation
- `POST /api/chat/messages` - Get messages (with pagination)
- `POST /api/chat/send` - Send text message
- `POST /api/chat/send-media` - Send image/voice message
- `POST /api/chat/mark-read` - Mark messages as read
- `POST /api/chat/typing` - Send typing indicator

### 4. WebSocket Channels

- `chat.{userId}` - Personal chat channel for each user
- `conversation.{conversationId}` - Conversation-specific channel

### 5. WebSocket Events

- `MessageSent` - When a new message is sent
- `MessageRead` - When messages are read
- `TypingIndicator` - When user is typing

## Features

✅ Real-time messaging via WebSocket
✅ Image sending with crop/edit functionality
✅ Voice message recording and sending
✅ Typing indicators
✅ Read receipts
✅ Online/offline status
✅ Unread message count
✅ Message pagination

## File Structure

```
flutter_chat_files/
├── ChatController.dart          # Main chat controller
├── ChatListScreen.dart          # Conversations list
├── ChatDetailScreen.dart        # Chat detail with messages
├── ImageCropperScreen.dart      # Image cropping screen
└── README_CHAT.md              # This file
```

## Usage

1. Import ChatController in your app
2. Navigate to ChatListScreen to see conversations
3. Tap on a conversation to open ChatDetailScreen
4. Use the + button to send images (with crop option)
5. Long press microphone to record voice messages

## Notes

- Images are automatically cropped before sending
- Voice messages show duration
- Messages are paginated (20 per page)
- WebSocket automatically reconnects
- Invalid tokens are cleaned up automatically
