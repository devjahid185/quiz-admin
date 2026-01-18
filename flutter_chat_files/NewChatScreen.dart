import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import 'dart:async';
import 'dart:convert';
import '../auth/auth_controller.dart';
import '../auth/api_service.dart';
import '../controllers/chat_controller.dart';
import 'chat_detail_screen.dart';

class NewChatScreen extends StatefulWidget {
  const NewChatScreen({Key? key}) : super(key: key);

  @override
  State<NewChatScreen> createState() => _NewChatScreenState();
}

class _NewChatScreenState extends State<NewChatScreen> {
  final TextEditingController _searchController = TextEditingController();
  final ChatController _chatController = Get.find<ChatController>();
  
  List<dynamic> _users = [];
  bool _isLoading = false;
  String _searchQuery = '';
  Timer? _debounceTimer;

  @override
  void initState() {
    super.initState();
    _fetchUsers();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    if (_debounceTimer?.isActive ?? false) _debounceTimer!.cancel();
    
    _debounceTimer = Timer(const Duration(milliseconds: 500), () {
      setState(() {
        _searchQuery = _searchController.text;
      });
      _fetchUsers();
    });
  }

  Future<void> _fetchUsers({int page = 1}) async {
    setState(() => _isLoading = true);

    try {
      final user = AuthController.user;
      final queryParams = {
        'email': user!['email'],
        'page': page.toString(),
        'per_page': '50',
      };

      if (_searchQuery.isNotEmpty) {
        queryParams['search'] = _searchQuery;
      }

      final queryString = Uri(queryParameters: queryParams).query;
      final baseUrl = "https://rema-cleansable-mirtha.ngrok-free.dev/api"; // Update with your API base URL
      final url = Uri.parse('$baseUrl/chat/users?$queryString');

      final response = await ApiService.post("/chat/users", {
        'email': user['email'],
        'page': page,
        'per_page': 50,
        if (_searchQuery.isNotEmpty) 'search': _searchQuery,
      });

      final data = jsonDecode(response.body);

      if (data['success'] == true) {
        setState(() {
          _users = data['data'];
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
        Get.snackbar("Error", "Failed to load users");
      }
    } catch (e) {
      setState(() => _isLoading = false);
      Get.snackbar("Error", "Failed to load users: $e");
    }
  }

  void _startChatWithUser(dynamic user) {
    _chatController.getOrCreateConversation(user['id']);
    Get.back(); // Close this screen
    Get.to(() => ChatDetailScreen()); // Open chat detail
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("New Chat"),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: Column(
        children: [
          // Search Bar
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: "Search users by name, email or phone...",
                prefixIcon: const Icon(Iconsax.search_normal, color: Colors.grey),
                filled: true,
                fillColor: Colors.grey.shade100,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
          ),

          // Users List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _users.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Iconsax.people, size: 64, color: Colors.grey.shade400),
                            const SizedBox(height: 16),
                            Text(
                              _searchQuery.isEmpty
                                  ? "No users found"
                                  : "No users found for '$_searchQuery'",
                              style: TextStyle(color: Colors.grey.shade600),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        itemCount: _users.length,
                        separatorBuilder: (context, index) => const Divider(height: 1),
                        itemBuilder: (context, index) {
                          final user = _users[index];
                          final isOnline = user['is_online'] == true || user['is_online'] == 1;

                          return ListTile(
                            leading: Stack(
                              children: [
                                CircleAvatar(
                                  radius: 28,
                                  backgroundImage: NetworkImage(
                                    user['image'] ?? "https://via.placeholder.com/150"
                                  ),
                                ),
                                if (isOnline)
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
                              user['name'] ?? 'Unknown',
                              style: const TextStyle(fontWeight: FontWeight.w500),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (user['email'] != null)
                                  Text(
                                    user['email'],
                                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                                  ),
                                if (user['phone_number'] != null)
                                  Text(
                                    user['phone_number'],
                                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                                  ),
                              ],
                            ),
                            trailing: Icon(
                              Iconsax.arrow_right_3,
                              color: Colors.grey.shade400,
                            ),
                            onTap: () => _startChatWithUser(user),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
