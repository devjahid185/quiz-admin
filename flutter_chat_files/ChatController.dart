import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:web_socket_channel/io.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:audioplayers/audioplayers.dart';
import '../auth/auth_controller.dart';
import '../auth/api_service.dart';

class ChatController extends GetxController {
  IOWebSocketChannel? channel;
  Timer? _pingTimer;
  Timer? _typingTimer;

  // ✅ Audio Player
  final AudioPlayer audioPlayer = AudioPlayer();
  var playingMessageId = 0.obs;
  var isPlaying = false.obs;

  // State Variables
  var isConnected = false.obs;
  var conversations = <dynamic>[].obs;
  var messages = <dynamic>[].obs;
  var currentConversationId = 0.obs;
  var currentOtherUser = <String, dynamic>{}.obs;
  var isLoading = false.obs;
  var otherUserTyping = false.obs;

  // Reverb/Socket Config
  final String reverbHost = "rema-cleansable-mirtha.ngrok-free.dev";
  final int reverbPort = 443;
  final String appKey = "yg38n0fru6n1pudejhyr";

  @override
  void onClose() {
    audioPlayer.dispose();
    _disconnect();
    _typingTimer?.cancel();
    super.onClose();
  }

  void _disconnect() {
    _pingTimer?.cancel();
    _typingTimer?.cancel();
    channel?.sink.close();
    isConnected.value = false;
  }

  // ================= CONVERSATIONS =================

  Future<void> fetchConversations() async {
    try {
      final user = AuthController.user;
      final res = await ApiService.post("/chat/conversations", {
        "email": user!['email']
      });
      final data = jsonDecode(res.body);
      if (data['success'] == true) {
        conversations.value = data['conversations'];
      }
    } catch (e) {
      debugPrint("Fetch conversations error: $e");
    }
  }

  // ✅ Improved: Proper async/await and error handling
  Future<bool> getOrCreateConversation(int otherUserId) async {
    try {
      isLoading.value = true;
      final user = AuthController.user;
      final res = await ApiService.post("/chat/conversation/get-or-create", {
        "user_email": user!['email'],
        "other_user_id": otherUserId
      });
      final data = jsonDecode(res.body);
      if (data['success'] == true) {
        currentConversationId.value = data['conversation_id'];
        currentOtherUser.value = Map<String, dynamic>.from(data['other_user']);

        connectToChat();
        await fetchMessages();
        return true;
      }
    } catch (e) {
      Get.snackbar("Error", e.toString());
    } finally {
      isLoading.value = false;
    }
    return false;
  }

  // ================= MESSAGES =================

  Future<void> fetchMessages({int? page = 1}) async {
    if (currentConversationId.value == 0) return;

    try {
      final user = AuthController.user;
      final res = await ApiService.post("/chat/messages", {
        "email": user!['email'],
        "conversation_id": currentConversationId.value,
        "page": page,
        "per_page": 20
      });
      final data = jsonDecode(res.body);
      if (data['success'] == true) {
        // ✅ Clear and assign properly
        if (page == 1) {
          messages.assignAll(data['messages']);
        } else {
          messages.insertAll(0, data['messages']);
        }
      }
    } catch (e) {
      debugPrint("Fetch messages error: $e");
    }
  }

  // ✅ Fixed: Don't add message from API response, only from WebSocket
  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty || currentConversationId.value == 0) return;

    try {
      final user = AuthController.user;
      final res = await ApiService.post("/chat/send", {
        "email": user!['email'],
        "conversation_id": currentConversationId.value,
        "message": text
      });
      final data = jsonDecode(res.body);
      if (data['success'] == true) {
        // ✅ Message will be added via WebSocket only, not from API response
        // Just update conversations list
        fetchConversations();
      }
    } catch (e) {
      Get.snackbar("Error", "Failed to send message");
    }
  }

  Future<void> sendMediaMessage(String filePath, String type, {String? caption, int? voiceDuration}) async {
    if (currentConversationId.value == 0) return;

    try {
      final user = AuthController.user;
      final baseUrl = "https://rema-cleansable-mirtha.ngrok-free.dev/api";

      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/chat/send-media'),
      );

      request.fields['email'] = user!['email'];
      request.fields['conversation_id'] = currentConversationId.value.toString();
      request.fields['type'] = type;
      if (caption != null) request.fields['message'] = caption;
      if (voiceDuration != null) request.fields['voice_duration'] = voiceDuration.toString();

      request.files.add(await http.MultipartFile.fromPath('file', filePath));

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      final data = jsonDecode(response.body);

      if (data['success'] == true) {
        // ✅ Message will be added via WebSocket only
        fetchConversations();
      } else {
        Get.snackbar("Error", data['message'] ?? "Failed to send media");
      }
    } catch (e) {
      Get.snackbar("Error", "Failed to send media: $e");
    }
  }

  Future<void> markAsRead() async {
    if (currentConversationId.value == 0) return;

    try {
      final user = AuthController.user;
      await ApiService.post("/chat/mark-read", {
        "email": user!['email'],
        "conversation_id": currentConversationId.value
      });

      // ✅ Update local messages properly
      final myId = user['id'];
      for (var i = 0; i < messages.length; i++) {
        if (messages[i]['receiver_id'] == myId && messages[i]['is_read'] != true) {
          messages[i] = Map<String, dynamic>.from(messages[i])
            ..['is_read'] = true
            ..['read_at'] = DateTime.now().toIso8601String();
        }
      }
      messages.refresh();
      fetchConversations();
    } catch (e) {
      debugPrint("Mark as read error: $e");
    }
  }

  // ✅ Improved: Typing indicator with debounce
  void sendTypingIndicator(bool typing) {
    if (currentConversationId.value == 0) return;

    // Cancel previous timer
    _typingTimer?.cancel();

    if (typing) {
      // Send immediately when starting to type
      _sendTypingToServer(typing);
      
      // Auto-stop after 3 seconds of no typing
      _typingTimer = Timer(const Duration(seconds: 3), () {
        _sendTypingToServer(false);
      });
    } else {
      _sendTypingToServer(false);
    }
  }

  void _sendTypingToServer(bool typing) {
    final user = AuthController.user;
    ApiService.post("/chat/typing", {
      "email": user!['email'],
      "conversation_id": currentConversationId.value,
      "is_typing": typing
    }).catchError((e) => debugPrint("Typing indicator error: $e"));
  }

  // ✅ Voice Message Player
  Future<void> playVoiceMessage(int messageId, String url) async {
    try {
      if (playingMessageId.value == messageId && isPlaying.value) {
        // Pause if playing same message
        await audioPlayer.pause();
        isPlaying.value = false;
        playingMessageId.value = 0;
      } else {
        // Stop current and play new
        await audioPlayer.stop();
        await audioPlayer.play(UrlSource(url));
        playingMessageId.value = messageId;
        isPlaying.value = true;

        // Reset on completion
        audioPlayer.onPlayerComplete.listen((event) {
          isPlaying.value = false;
          playingMessageId.value = 0;
        });
      }
    } catch (e) {
      Get.snackbar("Error", "Could not play audio");
    }
  }

  // ================= WEBSOCKET =================

  void connectToChat() {
    _disconnect();
    final myId = AuthController.user?['id'];
    if (myId == null) return;

    final wsUrl = 'wss://$reverbHost:$reverbPort/app/$appKey?protocol=7&client=js&version=8.4.0&flash=false';

    try {
      channel = IOWebSocketChannel.connect(Uri.parse(wsUrl));
      channel!.stream.listen(
        (message) => _handleEvent(message),
        onError: (error) {
          isConnected.value = false;
          _pingTimer?.cancel();
        },
        onDone: () {
          isConnected.value = false;
          _pingTimer?.cancel();
        },
      );
    } catch (e) {
      debugPrint("Chat connection error: $e");
    }
  }

  void _handleEvent(dynamic message) {
    try {
      final data = jsonDecode(message);
      final event = data['event'];
      var payload = data['data'];
      if (payload is String) payload = jsonDecode(payload);

      if (event == 'pusher:connection_established') {
        isConnected.value = true;
        _subscribe();
        _startPing();
      }
      else if (event == 'MessageSent' || event == 'App\\Events\\MessageSent') {
        final msg = payload['message'];
        final myId = AuthController.user?['id'];
        
        // ✅ Only process if this message belongs to current conversation
        if (msg['conversation_id'] == currentConversationId.value) {
          // ✅ Check for duplicate message (prevent double messages)
          final messageId = msg['id'];
          final exists = messages.any((m) => m['id'] == messageId);
          
          if (!exists) {
            messages.add(msg);
            messages.refresh();
          }
        }
        
        // ✅ Always update conversations list when message sent/received
        fetchConversations();
      }
      else if (event == 'MessageRead' || event == 'App\\Events\\MessageRead') {
        if (payload['conversation_id'] == currentConversationId.value) {
          final myId = AuthController.user!['id'];
          // ✅ Update read status for messages I sent
          for (var i = 0; i < messages.length; i++) {
            if (messages[i]['sender_id'] == myId && messages[i]['is_read'] != true) {
              messages[i] = Map<String, dynamic>.from(messages[i])
                ..['is_read'] = true;
            }
          }
          messages.refresh();
        }
      }
      else if (event == 'TypingIndicator' || event == 'App\\Events\\TypingIndicator') {
        // ✅ Typing indicator only shows for current conversation
        if (payload['conversation_id'] == currentConversationId.value) {
          otherUserTyping.value = payload['is_typing'] == true;
        }
      }
    } catch (e) {
      debugPrint("Chat event error: $e");
    }
  }

  void _subscribe() {
    final myId = AuthController.user?['id'];
    if (myId == null) return;

    // ✅ Subscribe to personal chat channel
    channel?.sink.add(jsonEncode({
      "event": "pusher:subscribe",
      "data": {"channel": "chat.$myId"}
    }));
  }

  void _startPing() {
    _pingTimer = Timer.periodic(const Duration(seconds: 25), (timer) {
      if (isConnected.value) {
        channel?.sink.add(jsonEncode({"event": "pusher:ping", "data": {}}));
      }
    });
  }
}
