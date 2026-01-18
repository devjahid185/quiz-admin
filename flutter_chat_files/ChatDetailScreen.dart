import 'dart:io';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import '../controllers/chat_controller.dart';
import '../auth/auth_controller.dart';
import 'image_cropper_screen.dart';

class ChatDetailScreen extends StatefulWidget {
  ChatDetailScreen({Key? key}) : super(key: key);

  @override
  State<ChatDetailScreen> createState() => _ChatDetailScreenState();
}

class _ChatDetailScreenState extends State<ChatDetailScreen> {
  final ChatController _controller = Get.find<ChatController>();
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final AudioRecorder _audioRecorder = AudioRecorder();
  bool _isRecording = false;
  int _recordingDuration = 0;
  Timer? _recordingTimer;

  @override
  void initState() {
    super.initState();
    _controller.markAsRead();
    
    // ✅ Auto-scroll when messages update
    ever(_controller.messages, (_) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _scrollToBottom();
      });
    });
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToBottom();
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _recordingTimer?.cancel();
    _audioRecorder.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isNotEmpty) {
      _controller.sendTypingIndicator(false); // Stop typing indicator
      _controller.sendMessage(text);
      _messageController.clear();
      // ✅ Scroll will happen automatically via ever() listener
    }
  }

  Future<void> _pickAndCropImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);

    if (image != null) {
      // Navigate to image cropper screen
      final croppedFile = await Get.to(() => ImageCropperScreen(imagePath: image.path));
      
      if (croppedFile != null && croppedFile is File) {
        await _controller.sendMediaMessage(croppedFile.path, 'image');
      }
    }
  }

  Future<void> _takePhoto() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.camera);

    if (image != null) {
      final croppedFile = await Get.to(() => ImageCropperScreen(imagePath: image.path));
      
      if (croppedFile != null && croppedFile is File) {
        await _controller.sendMediaMessage(croppedFile.path, 'image');
      }
    }
  }

  Future<void> _startRecording() async {
    try {
      if (await _audioRecorder.hasPermission()) {
        final path = await _getRecordingPath();
        await _audioRecorder.start(
          const RecordConfig(),
          path: path,
        );
        setState(() {
          _isRecording = true;
          _recordingDuration = 0;
        });
        _recordingTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
          setState(() {
            _recordingDuration++;
          });
        });
      } else {
        Get.snackbar("Permission", "Microphone permission required");
      }
    } catch (e) {
      Get.snackbar("Error", "Failed to start recording");
    }
  }

  Future<void> _stopRecording(bool send) async {
    try {
      final path = await _audioRecorder.stop();
      _recordingTimer?.cancel();
      setState(() {
        _isRecording = false;
      });

      if (send && path != null) {
        await _controller.sendMediaMessage(path, 'voice', voiceDuration: _recordingDuration);
      }
      
      setState(() {
        _recordingDuration = 0;
      });
    } catch (e) {
      Get.snackbar("Error", "Failed to stop recording");
    }
  }

  Future<String> _getRecordingPath() async {
    final directory = await getTemporaryDirectory();
    return '${directory.path}/voice_${DateTime.now().millisecondsSinceEpoch}.m4a';
  }

  void _showMediaOptions() {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Iconsax.gallery),
              title: const Text("Choose from Gallery"),
              onTap: () {
                Get.back();
                _pickAndCropImage();
              },
            ),
            ListTile(
              leading: const Icon(Iconsax.camera),
              title: const Text("Take Photo"),
              onTap: () {
                Get.back();
                _takePhoto();
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final otherUser = _controller.currentOtherUser;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            CircleAvatar(
              backgroundImage: NetworkImage(otherUser['image'] ?? "https://via.placeholder.com/150"),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(otherUser['name'] ?? 'User'),
                  Obx(() => Text(
                    _controller.otherUserTyping.value ? "typing..." : (otherUser['is_online'] == true ? "Online" : "Offline"),
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  )),
                ],
              ),
            ),
          ],
        ),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: Column(
        children: [
          // Messages List
          Expanded(
            child: Obx(() {
              if (_controller.messages.isEmpty) {
                return Center(
                  child: Text("No messages yet", style: TextStyle(color: Colors.grey.shade600)),
                );
              }

              return ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(16),
                itemCount: _controller.messages.length,
                itemBuilder: (context, index) {
                  final msg = _controller.messages[index];
                  final isMe = msg['sender_id'] == AuthController.user?['id'];
                  
                  return _buildMessageBubble(msg, isMe);
                },
              );
            }),
          ),

          // Recording Indicator
          if (_isRecording)
            Container(
              padding: const EdgeInsets.all(16),
              color: Colors.red.shade50,
              child: Row(
                children: [
                  Icon(Iconsax.microphone_2, color: Colors.red),
                  const SizedBox(width: 12),
                  Text(
                    _formatDuration(_recordingDuration),
                    style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red),
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: () => _stopRecording(false),
                    child: const Text("Cancel"),
                  ),
                  ElevatedButton(
                    onPressed: () => _stopRecording(true),
                    child: const Text("Send"),
                  ),
                ],
              ),
            ),

          // Input Area
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.shade200,
                  blurRadius: 4,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Iconsax.add_circle),
                  onPressed: _showMediaOptions,
                ),
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: "Type a message...",
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(25),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: Colors.grey.shade100,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                    maxLines: null,
                    textCapitalization: TextCapitalization.sentences,
                    onChanged: (text) {
                      _controller.sendTypingIndicator(text.isNotEmpty);
                    },
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                Obx(() {
                  if (_isRecording) {
                    return IconButton(
                      icon: const Icon(Iconsax.stop, color: Colors.red),
                      onPressed: () => _stopRecording(true),
                    );
                  }
                  return IconButton(
                    icon: _messageController.text.trim().isNotEmpty
                        ? const Icon(Iconsax.send_1)
                        : const Icon(Iconsax.microphone_2),
                    onPressed: _messageController.text.trim().isNotEmpty
                        ? _sendMessage
                        : () => _startRecording(),
                  );
                }),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(dynamic msg, bool isMe) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        child: Column(
          crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isMe ? Colors.indigo : Colors.grey.shade200,
                borderRadius: BorderRadius.circular(16),
              ),
              child: _buildMessageContent(msg, isMe),
            ),
            if (msg['is_read'] == true && isMe)
              Padding(
                padding: const EdgeInsets.only(top: 4, right: 8),
                child: Icon(Iconsax.tick_circle, size: 16, color: Colors.indigo),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageContent(dynamic msg, bool isMe) {
    switch (msg['type']) {
      case 'text':
        return Text(
          msg['message'] ?? '',
          style: TextStyle(color: isMe ? Colors.white : Colors.black87),
        );
      
      case 'image':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (msg['message'] != null && msg['message'].toString().isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(
                  msg['message'],
                  style: TextStyle(color: isMe ? Colors.white : Colors.black87),
                ),
              ),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                msg['media_url'] ?? '',
                width: 200,
                height: 200,
                fit: BoxFit.cover,
                loadingBuilder: (context, child, loadingProgress) {
                  if (loadingProgress == null) return child;
                  return Container(
                    width: 200,
                    height: 200,
                    color: Colors.grey.shade300,
                    child: Center(child: CircularProgressIndicator()),
                  );
                },
              ),
            ),
          ],
        );
      
      case 'voice':
        return Obx(() {
          final isCurrentPlaying = _controller.playingMessageId.value == msg['id'] && _controller.isPlaying.value;
          return InkWell(
            onTap: () => _controller.playVoiceMessage(msg['id'], msg['media_url'] ?? ''),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  isCurrentPlaying ? Iconsax.pause : Iconsax.play,
                  color: isMe ? Colors.white : Colors.indigo,
                ),
                const SizedBox(width: 8),
                Text(
                  _formatDuration(msg['voice_duration'] ?? 0),
                  style: TextStyle(color: isMe ? Colors.white : Colors.black87),
                ),
              ],
            ),
          );
        });
      
      default:
        return Text(
          msg['message'] ?? '',
          style: TextStyle(color: isMe ? Colors.white : Colors.black87),
        );
    }
  }

  String _formatDuration(int seconds) {
    final minutes = seconds ~/ 60;
    final secs = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }
}
