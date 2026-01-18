import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../controllers/chat_controller.dart';
import 'chat_detail_screen.dart';
import 'new_chat_screen.dart';

class ChatListScreen extends StatelessWidget {
  ChatListScreen({Key? key}) : super(key: key);

  final ChatController _controller = Get.put(ChatController());

  @override
  Widget build(BuildContext context) {
    _controller.fetchConversations();

    return Scaffold(
      appBar: AppBar(
        title: const Text("Messages"),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        actions: [
          IconButton(
            icon: const Icon(Iconsax.add),
            onPressed: () {
              Get.to(() => NewChatScreen());
            },
            tooltip: "New Chat",
          ),
        ],
      ),
      body: Obx(() {
        if (_controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        if (_controller.conversations.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Iconsax.message, size: 64, color: Colors.grey.shade400),
                const SizedBox(height: 16),
                Text("No conversations yet", style: TextStyle(color: Colors.grey.shade600)),
              ],
            ),
          );
        }

        return ListView.builder(
          itemCount: _controller.conversations.length,
          itemBuilder: (context, index) {
            final conv = _controller.conversations[index];
            final otherUser = conv['other_user'];
            final lastMessage = conv['last_message'];
            final unreadCount = conv['unread_count'] ?? 0;

            return ListTile(
              leading: Stack(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundImage: NetworkImage(otherUser['image'] ?? "https://via.placeholder.com/150"),
                  ),
                  if (otherUser['is_online'] == true)
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        width: 14,
                        height: 14,
                        decoration: BoxDecoration(
                          color: Colors.green,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                      ),
                    )
                ],
              ),
              title: Text(
                otherUser['name'],
                style: TextStyle(
                  fontWeight: unreadCount > 0 ? FontWeight.bold : FontWeight.normal,
                ),
              ),
              subtitle: Text(
                lastMessage != null
                    ? (lastMessage['type'] == 'text'
                        ? lastMessage['message']
                        : lastMessage['type'] == 'image'
                            ? '📷 Image'
                            : lastMessage['type'] == 'voice'
                                ? '🎤 Voice message'
                                : '📎 File')
                    : 'No messages yet',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: unreadCount > 0 ? Colors.black87 : Colors.grey.shade600,
                ),
              ),
              trailing: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (lastMessage != null)
                    Text(
                      _formatTime(lastMessage['created_at']),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  if (unreadCount > 0)
                    Container(
                      margin: const EdgeInsets.only(top: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.indigo,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        unreadCount > 99 ? '99+' : '$unreadCount',
                        style: const TextStyle(color: Colors.white, fontSize: 12),
                      ),
                    ),
                ],
              ),
              onTap: () {
                _controller.getOrCreateConversation(otherUser['id']);
                Get.to(() => ChatDetailScreen());
              },
            );
          },
        );
      }),
    );
  }

  String _formatTime(String? timeString) {
    if (timeString == null) return '';
    try {
      final time = DateTime.parse(timeString);
      final now = DateTime.now();
      final diff = now.difference(time);

      if (diff.inDays == 0) {
        return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
      } else if (diff.inDays == 1) {
        return 'Yesterday';
      } else if (diff.inDays < 7) {
        return '${diff.inDays}d ago';
      } else {
        return '${time.day}/${time.month}';
      }
    } catch (e) {
      return '';
    }
  }
}
