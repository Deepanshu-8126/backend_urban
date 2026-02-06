import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/api_service.dart';
import '../complaints/citizen_form.dart';

class CityBrainBot extends StatefulWidget {
  const CityBrainBot({super.key});
  @override
  State<CityBrainBot> createState() => _CityBrainBotState();
}

class _CityBrainBotState extends State<CityBrainBot> {
  final FlutterTts _flutterTts = FlutterTts();
  final TextEditingController _ctrl = TextEditingController();
  List<Map<String, dynamic>> messages = [];
  List<Map<String, dynamic>> chatHistory = [];
  String? currentChatId;
  bool isTyping = false;
  bool isLoadingHistory = true;
  final ScrollController _scrollController = ScrollController();
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  
  
  final ImagePicker _picker = ImagePicker();
  stt.SpeechToText? _speech;
  bool _isListening = false;
  XFile? _selectedImage;

  
  String? currentIntent;
  Map<String, dynamic> collectedData = {};
  String _greetingMessage = "";

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadGreeting();
      _loadChatsFromLocal(); 
      _loadChatHistoryFromBackend(); 
      _startNewChat();
      _initTts();
    });
  }

  Future<void> _initTts() async {
    await _flutterTts.setLanguage("en-IN");
    await _flutterTts.setPitch(1.0);
    await _flutterTts.setSpeechRate(0.5);
  }

  Future<void> _speak(String text) async {
    if (text.isNotEmpty) {
      await _flutterTts.speak(text);
    }
  }

  Future<void> _loadGreeting() async {
    final prefs = await SharedPreferences.getInstance();
    final userName = prefs.getString('name') ?? 'Citizen';
    final hour = DateTime.now().hour;
    
    String greeting;
    if (hour >= 5 && hour < 12) {
      greeting = "Good Morning, $userName! ☀️";
    } else if (hour >= 12 && hour < 17) {
      greeting = "Good Afternoon, $userName! 🌤️";
    } else if (hour >= 17 && hour < 21) {
      greeting = "Good Evening, $userName! 🌇";
    } else {
      greeting = "Hello, $userName! 🌙";
    }

    if (mounted) {
      setState(() {
        _greetingMessage = greeting;
      });
    }
  }

  void _startNewChat() {
    setState(() {
      currentChatId = DateTime.now().millisecondsSinceEpoch.toString();
      messages = [];
      _selectedImage = null;
      currentIntent = null;
      collectedData = {};
    });
  }

  
  
  

  Future<void> _loadChatHistoryFromBackend() async {
    setState(() => isLoadingHistory = true);
    try {
      final sessions = await ApiService.getChatHistory();
      if (mounted) {
        setState(() {
          chatHistory = sessions.map((s) => s as Map<String, dynamic>).toList();
          isLoadingHistory = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading chat history: $e');
      if (mounted) setState(() => isLoadingHistory = false);
    }
  }

  Future<void> _saveCurrentChatToBackend() async {
    if (messages.isEmpty) {
      debugPrint('❌ Skipping save: No messages');
      return;
    }
    
    try {
      debugPrint('💾 Saving chat session...');
      debugPrint('Session ID: $currentChatId');
      debugPrint('Message count: ${messages.length}');
      
      final firstUserMsg = messages.firstWhere(
        (m) => m['sender'] == 'user',
        orElse: () => {'text': 'New Chat'}
      );
      
      final title = (firstUserMsg['text']?.toString() ?? 'New Chat')
          .substring(0, (firstUserMsg['text']?.toString().length ?? 8).clamp(0, 30));

      debugPrint('Title: $title');

      final success = await ApiService.saveChatSession(
        sessionId: currentChatId ?? DateTime.now().millisecondsSinceEpoch.toString(),
        title: title,
        messages: messages,
      );

      if (success) {
        debugPrint('✅ Chat session saved successfully');
        
        await _loadChatHistoryFromBackend();
      } else {
        debugPrint('❌ Failed to save chat session');
      }
    } catch (e) {
      debugPrint('❌ Error saving chat: $e');
    }
  }

  Future<void> _loadChatFromBackend(String sessionId) async {
    try {
      final session = await ApiService.loadChatSession(sessionId);
      if (session != null && mounted) {
        setState(() {
          currentChatId = session['sessionId'];
          messages = List<Map<String, dynamic>>.from(session['messages'] ?? []);
          _selectedImage = null;
          currentIntent = null;
          collectedData = {};
        });
        Navigator.of(context).pop();
        _scrollToBottom();
      }
    } catch (e) {
      debugPrint('Error loading chat: $e');
    }
  }

  Future<void> _deleteChatFromBackend(String sessionId) async {
    try {
      final success = await ApiService.deleteChatSession(sessionId);
      if (success) {
        await _loadChatHistoryFromBackend();
        if (currentChatId == sessionId) {
          _startNewChat();
        }
      }
    } catch (e) {
      debugPrint('Error deleting chat: $e');
    }
  }

  
  
  

  Future<void> _loadChatsFromLocal() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      List<String> chatIds = prefs.getStringList('chat_ids') ?? [];
      
      List<Map<String, dynamic>> localChats = [];
      for (String id in chatIds) {
        String? chatData = prefs.getString('chat_$id');
        if (chatData != null) {
          try {
            Map<String, dynamic> chat = jsonDecode(chatData);
            localChats.add(chat);
          } catch (e) {
            debugPrint('Error parsing chat $id: $e');
          }
        }
      }
      
      if (mounted) {
        setState(() {
          chatHistory = localChats;
          isLoadingHistory = false;
        });
        debugPrint('✅ Loaded ${localChats.length} chats from local storage');
      }
    } catch (e) {
      debugPrint('Error loading local chats: $e');
      if (mounted) setState(() => isLoadingHistory = false);
    }
  }

  Future<void> _saveChatToLocal() async {
    if (messages.isEmpty || currentChatId == null) return;
    
    try {
      final prefs = await SharedPreferences.getInstance();
      
      final firstUserMsg = messages.firstWhere(
        (m) => m['sender'] == 'user',
        orElse: () => {'text': 'New Chat'}
      );
      
      final title = (firstUserMsg['text']?.toString() ?? 'New Chat')
          .substring(0, (firstUserMsg['text']?.toString().length ?? 8).clamp(0, 30));
      
      final chatData = {
        'sessionId': currentChatId,
        'title': title,
        'messages': messages,
        'updatedAt': DateTime.now().toIso8601String(),
      };
      
      
      await prefs.setString('chat_$currentChatId', jsonEncode(chatData));
      
      
      List<String> chatIds = prefs.getStringList('chat_ids') ?? [];
      if (!chatIds.contains(currentChatId)) {
        chatIds.insert(0, currentChatId!);
        await prefs.setStringList('chat_ids', chatIds);
      }
      
      debugPrint('💾 Saved chat to local storage: $currentChatId');
      
      
      await _loadChatsFromLocal();
    } catch (e) {
      debugPrint('Error saving chat to local: $e');
    }
  }

  Future<void> _loadChatFromLocal(String sessionId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      String? chatData = prefs.getString('chat_$sessionId');
      
      if (chatData != null && mounted) {
        Map<String, dynamic> chat = jsonDecode(chatData);
        setState(() {
          currentChatId = chat['sessionId'];
          messages = List<Map<String, dynamic>>.from(chat['messages'] ?? []);
          _selectedImage = null;
          currentIntent = null;
          collectedData = {};
        });
        Navigator.of(context).pop();
        _scrollToBottom();
        debugPrint('✅ Loaded chat from local storage: $sessionId');
      }
    } catch (e) {
      debugPrint('Error loading chat from local: $e');
    }
  }

  Future<void> _deleteChatFromLocal(String sessionId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      
      await prefs.remove('chat_$sessionId');
      
      
      List<String> chatIds = prefs.getStringList('chat_ids') ?? [];
      chatIds.remove(sessionId);
      await prefs.setStringList('chat_ids', chatIds);
      
      
      await _loadChatsFromLocal();
      
      if (currentChatId == sessionId) {
        _startNewChat();
      }
      
      debugPrint('🗑️ Deleted chat from local storage: $sessionId');
    } catch (e) {
      debugPrint('Error deleting chat from local: $e');
    }
  }

  
  
  

  Future<void> askAI(String query) async {
    if (query.trim().isEmpty && _selectedImage == null) return;

    String userMessage = query.trim();
    String apiQuery = userMessage;

    if (_selectedImage != null) {
      userMessage = "[Image: ${_selectedImage!.name}]\n$userMessage";
      apiQuery = "User uploaded an image named '${_selectedImage!.name}'. They say: $query.";
    }

    setState(() {
      messages.add({"sender": "user", "text": userMessage});
      isTyping = true;
      _selectedImage = null;
    });
    _ctrl.clear();
    _scrollToBottom();

    String chatContext = messages.length > 1
        ? messages.take(messages.length - 1).map((m) => "${m['sender']}: ${m['text']}").join("\n")
        : "";

    try {
      final aiResponse = await ApiService.chatWithCityBrain(
        question: apiQuery,
        context: chatContext,
      );

      if (mounted) {
        String answer = aiResponse['answer'] ?? "I'm not sure about that.";
        String intent = aiResponse['intent'] ?? "GENERAL_QUERY";
        bool readyToExecute = aiResponse['readyToExecute'] ?? false;
        Map<String, dynamic> data = aiResponse['data'] ?? {};

        
        setState(() {
          currentIntent = intent;
          collectedData = data;
          messages.add({
            "sender": "bot",
            "text": answer,
            "intent": intent,
            "timestamp": DateTime.now().toIso8601String(),
          });
          
          _speak(answer); // ✅ Speak the answer
        });

        
        if (readyToExecute) {
          await _executeAction(intent, data);
        }

        await _saveCurrentChatToBackend();
        await _saveChatToLocal(); 
      }
    } catch (e) {
      debugPrint('AI Error: $e');
      if (mounted) {
        setState(() {
          messages.add({
            "sender": "bot",
            "text": "I'm having trouble connecting. Please check your internet.",
          });
        });
      }
    } finally {
      if (mounted) {
        setState(() => isTyping = false);
      }
      _scrollToBottom();
    }
  }

  
  
  

  Future<void> _executeAction(String intent, Map<String, dynamic> data) async {
    switch (intent) {
      case 'NAVIGATE_ADMIN':
        await _handleAdminNavigation(data);
        break;
      case 'SHOW_ANALYTICS':
        await _handleAnalyticsAction(data);
        break;
      case 'DRAFT_NOTIFICATION':
        await _handleNotificationAction(data);
        break;
      case 'FILE_COMPLAINT':
        await _handleComplaintAction(data);
        break;
      case 'CHECK_AQI':
        await _handleAQIAction(data);
        break;
      case 'CALCULATE_TAX':
        await _handleTaxAction(data);
        break;
      case 'TRIGGER_SOS':
        await _handleSOSAction(data);
        break;
      default:
        break;
    }
  }

  // 👮‍♂️ ADMIN HANDLERS
  Future<void> _handleAdminNavigation(Map<String, dynamic> data) async {
    if (!mounted) return;
    
    // Simulate loading
    setState(() => messages.add({ "sender": "bot", "text": "Navigate to ${data['screen']}...", "type": "loading" }));
    await Future.delayed(const Duration(seconds: 1));
    setState(() => messages.removeLast());

    if (data['screen'] == 'AdminComplaintList') {
       // Navigate to Admin Complaints
       Navigator.pushNamed(context, '/admin/complaints'); // Adjust route as needed
    } else if (data['screen'] == 'MonitorMap') {
       Navigator.pushNamed(context, '/admin/map');
    } else {
       ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Navigation to ${data['screen']} not implemented yet")));
    }
  }

  Future<void> _handleAnalyticsAction(Map<String, dynamic> data) async {
    if (mounted) {
      setState(() {
        messages.add({
          "sender": "bot",
          "text": "📊 **City Stats (Today)**\n\n🔹 New Complaints: 42\n🔹 Solved: 15\n🔹 Critical: 3\n\nEfficiency: 85%",
          "type": "analytics_card" // You can create a custom widget for this later
        });
      });
    }
  }

  Future<void> _handleNotificationAction(Map<String, dynamic> data) async {
    if (mounted) {
      setState(() {
        messages.add({
          "sender": "bot",
          "text": "✅ Notification Drafted:\n'${data['title']}'\n\nRedirecting to broadcast screen...",
        });
      });
      // Future: Navigate to notification screen with pre-filled data
    }
  }

  // 🧑‍🤝‍🧑 CITIZEN HANDLERS
  Future<void> _handleComplaintAction(Map<String, dynamic> data) async {
    await Future.delayed(const Duration(milliseconds: 500));
    if (mounted) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => CitizenForm(
            initialTitle: data['title'] ?? '',
            initialDescription: data['description'] ?? '',
            initialCategory: data['category'] ?? 'Other',
          ),
        ),
      );
    }
  }

  Future<void> _handleAQIAction(Map<String, dynamic> data) async {
    if (mounted) {
      setState(() {
        messages.add({
          "sender": "bot",
          "text": "Fetching AQI data for your location...",
          "type": "aqi_loading"
        });
      });
    }
    
    await Future.delayed(const Duration(seconds: 1));
    
    if (mounted) {
      setState(() {
        messages.removeLast(); 
        messages.add({
          "sender": "bot",
          "text": "AQI: 125 (Moderate)\nPM2.5: 55 µg/m³\nPM10: 90 µg/m³",
          "type": "aqi_result"
        });
      });
    }
  }

  Future<void> _handleTaxAction(Map<String, dynamic> data) async {
    if (mounted) {
      setState(() {
        messages.add({
          "sender": "bot",
          "text": "Calculating property tax...",
          "type": "tax_loading"
        });
      });
    }

    await Future.delayed(const Duration(seconds: 1));
    
    if (mounted) {
      setState(() {
        messages.removeLast();
        messages.add({
          "sender": "bot",
          "text": "Estimated Annual Tax: ₹12,500\nBased on: ${data['propertyType']} - ${data['area']} sq ft",
          "type": "tax_result"
        });
      });
    }
  }

  Future<void> _handleSOSAction(Map<String, dynamic> data) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('⚠️ Trigger SOS?'),
        content: const Text('This will alert emergency services. Confirm?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Confirm SOS'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      setState(() {
        messages.add({
          "sender": "bot",
          "text": "🚨 SOS Triggered! Emergency services have been notified.",
          "type": "sos_confirmed"
        });
      });
    }
  }

  
  
  

  Future<void> _pickImage() async {
    try {
      final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
      if (image != null) {
        setState(() => _selectedImage = image);
      }
    } catch (e) {
      debugPrint('Error picking image: $e');
    }
  }

  Future<void> _startListening() async {
    _speech ??= stt.SpeechToText();
    bool available = await _speech!.initialize(
      onStatus: (status) {
        if (status == 'notListening') setState(() => _isListening = false);
      },
      onError: (error) => debugPrint('STT Error: $error'),
    );

    if (available) {
      setState(() => _isListening = true);
      _speech!.listen(
        onResult: (result) {
          setState(() {
            _ctrl.text = result.recognizedWords;
          });
        },
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Voice recognition not available")),
      );
    }
  }

  void _stopListening() {
    if (_speech != null) _speech!.stop();
    setState(() => _isListening = false);
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  List<String> _getSmartSuggestions(String lastMessage, String? intent) {
    
    if (intent == 'FILE_COMPLAINT') {
      return ["Add more details", "Change category", "File another complaint"];
    } else if (intent == 'CHECK_AQI') {
      return ["Health tips", "Check another location", "AQI history"];
    } else if (intent == 'CALCULATE_TAX') {
      return ["Payment options", "Tax deadline", "Calculate for another property"];
    }

    
    final lower = lastMessage.toLowerCase();
    
    if (lower.contains('paani') || lower.contains('water')) {
      return ["Water schedule?", "Report water issue", "Request tanker"];
    } else if (lower.contains('complaint') || lower.contains('file')) {
      return ["File complaint", "Check status", "Upload photo"];
    } else if (lower.contains('tax')) {
      return ["Calculate tax", "Payment methods", "Due date"];
    } else {
      return ["Tell me more", "How does this work?", "Need help"];
    }
  }

  
  
  

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: const Color(0xFFF5F7FA),
      drawer: _buildChatHistorySidebar(),
      appBar: _buildAppBar(),
      body: Column(
        children: [
          // 🌅 GREETING HEADER
          if (_greetingMessage.isNotEmpty && messages.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.05),
                border: Border(bottom: BorderSide(color: Colors.blue.withOpacity(0.1))),
              ),
              child: Column(
                children: [
                   Text(
                    _greetingMessage,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.blue,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    "How can I help you today?",
                    style: TextStyle(fontSize: 14, color: Colors.grey),
                  ),
                ],
              ),
            ),
          Expanded(
            child: messages.isEmpty
                ? _buildWelcomeScreen()
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: messages.length,
                    itemBuilder: (ctx, i) {
                      bool isUser = messages[i]['sender'] == "user";
                      return _buildMessageBubble(messages[i], isUser, i);
                    },
                  ),
          ),
          if (isTyping) _buildTypingIndicator(),
          _buildInputArea(),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      elevation: 0,
      flexibleSpace: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF0056D2), Color(0xFF00A896)], // Civic Blue -> Tech Teal
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
      ),
      leading: IconButton(
        icon: const Icon(Icons.menu, color: Colors.white),
        onPressed: () => _scaffoldKey.currentState?.openDrawer(),
      ),
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.psychology, size: 24, color: Colors.white),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("City Brain AI", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                Text("Agentic Intelligence", style: TextStyle(fontSize: 11, color: Colors.white70)),
              ],
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.add_circle_outline, color: Colors.white),
          onPressed: _startNewChat,
          tooltip: "New Chat",
        ),
      ],
    );
  }

  Widget _buildChatHistorySidebar() {
    return Drawer(
      child: Container(
        color: const Color(0xFFF5F7FA),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.deepPurple, Colors.purpleAccent],
                ),
              ),
              child: SafeArea(
                child: Row(
                  children: [
                    const Icon(Icons.psychology, color: Colors.white, size: 32),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        "Chat History",
                        style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: isLoadingHistory
                  ? const Center(child: CircularProgressIndicator())
                  : chatHistory.isEmpty
                      ? _buildEmptyHistory()
                      : ListView.builder(
                          padding: const EdgeInsets.all(8),
                          itemCount: chatHistory.length,
                          itemBuilder: (ctx, i) => _buildHistoryItem(chatHistory[i]),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyHistory() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.chat_bubble_outline, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text("No chat history yet", style: TextStyle(color: Colors.grey[600])),
          const SizedBox(height: 8),
          Text("Start a conversation!", style: TextStyle(color: Colors.grey[500], fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildHistoryItem(Map<String, dynamic> chat) {
    final isActive = chat['sessionId'] == currentChatId;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: isActive ? Colors.deepPurple.withOpacity(0.1) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isActive ? Colors.deepPurple : Colors.transparent,
          width: 2,
        ),
      ),
      child: ListTile(
        leading: const Icon(Icons.chat, color: Colors.deepPurple),
        title: Text(
          chat['title'] ?? 'Chat',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        subtitle: Text(
          _formatTimestamp(chat['updatedAt']),
          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
        ),
        trailing: IconButton(
          icon: const Icon(Icons.delete_outline, color: Colors.red, size: 20),
          onPressed: () async {
            await _deleteChatFromLocal(chat['sessionId']);
            await _deleteChatFromBackend(chat['sessionId']); 
          },
        ),
        onTap: () async {
          await _loadChatFromLocal(chat['sessionId']);
          
        },
      ),
    );
  }

  String _formatTimestamp(String? timestamp) {
    if (timestamp == null) return '';
    try {
      final dt = DateTime.parse(timestamp);
      final now = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inDays > 0) return '${diff.inDays}d ago';
      if (diff.inHours > 0) return '${diff.inHours}h ago';
      if (diff.inMinutes > 0) return '${diff.inMinutes}m ago';
      return 'Just now';
    } catch (e) {
      return '';
    }
  }

  Widget _buildWelcomeScreen() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Colors.deepPurple, Colors.purpleAccent],
                ),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.deepPurple.withOpacity(0.4),
                    blurRadius: 30,
                    offset: const Offset(0, 15),
                  ),
                ],
              ),
              child: const Icon(Icons.psychology, size: 80, color: Colors.white),
            ),
            const SizedBox(height: 32),
            const Text(
              "City Brain AI",
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.deepPurple),
            ),
            const SizedBox(height: 8),
            Text(
              "Your agentic urban assistant",
              style: TextStyle(fontSize: 18, color: Colors.grey[600]),
            ),
            const SizedBox(height: 48),
            const Text(
              "What can I help you with?",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.black87),
            ),
            const SizedBox(height: 20),
            _buildQuickQuestion("File a complaint", Icons.report_problem),
            _buildQuickQuestion("Check AQI levels", Icons.air),
            _buildQuickQuestion("Calculate property tax", Icons.account_balance),
            _buildQuickQuestion("Paani kab aayega?", Icons.water_drop),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickQuestion(String question, IconData icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        elevation: 3,
        shadowColor: Colors.deepPurple.withOpacity(0.2),
        child: InkWell(
          onTap: () => askAI(question),
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.deepPurple.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: Colors.deepPurple, size: 24),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Text(
                    question,
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
                  ),
                ),
                const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMessageBubble(Map<String, dynamic> message, bool isUser, int index) {
    final text = message['text'] ?? '';
    final intent = message['intent'];
    
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Column(
        crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (!isUser) ...[
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF0056D2), Color(0xFF00A896)],
                      ),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.psychology, size: 20, color: Colors.white),
                  ),
                  const SizedBox(width: 10),
                ],
                Flexible(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                    decoration: BoxDecoration(
                      color: isUser ? const Color(0xFF0056D2) : Colors.white,
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(20),
                        topRight: const Radius.circular(20),
                        bottomLeft: isUser ? const Radius.circular(20) : const Radius.circular(4),
                        bottomRight: isUser ? const Radius.circular(4) : const Radius.circular(20),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Text(
                      text,
                      style: TextStyle(
                        color: isUser ? Colors.white : Colors.black87,
                        fontSize: 15,
                        height: 1.5,
                      ),
                    ),
                  ),
                ),
                if (isUser) ...[
                  const SizedBox(width: 10),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF0056D2), Color(0xFF00A896)],
                      ),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.person, size: 20, color: Colors.white),
                  ),
                ],
              ],
            ),
          ),
          if (!isUser && index == messages.length - 1 && !isTyping)
            Padding(
              padding: const EdgeInsets.only(left: 48, bottom: 16),
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _getSmartSuggestions(text, intent)
                    .map((suggestion) => _buildSmartChip(suggestion))
                    .toList(),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSmartChip(String label) {
    return InkWell(
      onTap: () => askAI(label),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.deepPurple.withOpacity(0.1), Colors.purpleAccent.withOpacity(0.1)],
          ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.deepPurple.withOpacity(0.3), width: 1.5),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.auto_awesome, size: 14, color: Colors.deepPurple),
            const SizedBox(width: 6),
            Text(
              label,
              style: const TextStyle(fontSize: 13, color: Colors.deepPurple, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.deepPurple, Colors.purpleAccent],
              ),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.psychology, size: 20, color: Colors.white),
          ),
          const SizedBox(width: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.08),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildAnimatedDot(),
                const SizedBox(width: 5),
                _buildAnimatedDot(),
                const SizedBox(width: 5),
                _buildAnimatedDot(),
                const SizedBox(width: 12),
                Text("Thinking...", style: TextStyle(color: Colors.grey[700], fontSize: 14)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnimatedDot() {
    return TweenAnimationBuilder(
      tween: Tween<double>(begin: 0.3, end: 1.0),
      duration: const Duration(milliseconds: 800),
      curve: Curves.easeInOut,
      builder: (context, double value, child) {
        return Opacity(
          opacity: value,
          child: Container(
            width: 8,
            height: 8,
            decoration: const BoxDecoration(
              color: Colors.deepPurple,
              shape: BoxShape.circle,
            ),
          ),
        );
      },
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.grey[200]!)),
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -2))],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (_selectedImage != null)
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                   color: const Color(0xFF0056D2).withOpacity(0.1),
                   borderRadius: BorderRadius.circular(20),
                   border: Border.all(color: const Color(0xFF0056D2).withOpacity(0.3))
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.image, size: 16, color: Color(0xFF0056D2)),
                    const SizedBox(width: 8),
                    Flexible(child: Text("Image attached: ${_selectedImage!.name}", style: const TextStyle(fontSize: 12, color: Color(0xFF0056D2)), overflow: TextOverflow.ellipsis)),
                    const SizedBox(width: 8),
                    InkWell(onTap: () => setState(() => _selectedImage = null), child: const Icon(Icons.close, size: 16, color: Color(0xFF0056D2)))
                  ],
                ),
              ),
            
            Row(
              children: [
                IconButton(
                  icon: Icon(Icons.image_outlined, color: Colors.grey[600]),
                  onPressed: _pickImage,
                  tooltip: "Upload Image",
                ),
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.grey[300]!)
                    ),
                    child: TextField(
                      controller: _ctrl,
                      enabled: !isTyping,
                      decoration: InputDecoration(
                        hintText: isTyping ? "AI is thinking..." : "Ask about complaints, tax, etc...",
                        hintStyle: TextStyle(color: Colors.grey[500]),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                      ),
                      onSubmitted: (val) {
                         if (!isTyping) askAI(val);
                      },
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                // 🎙️ MIC BUTTON (Visible when text is empty)
                if (_ctrl.text.isEmpty)
                  GestureDetector(
                    onTap: _isListening ? _stopListening : _startListening,
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: _isListening ? Colors.redAccent : const Color(0xFF00A896),
                        shape: BoxShape.circle,
                        boxShadow: [
                          if (_isListening)
                            BoxShadow(color: Colors.redAccent.withOpacity(0.5), blurRadius: 10, spreadRadius: 2)
                        ],
                      ),
                      child: Icon(_isListening ? Icons.stop : Icons.mic, color: Colors.white, size: 24),
                    ),
                  ),

                // 🚀 SEND BUTTON (Visible when text is NOT empty)
                if (_ctrl.text.isNotEmpty)
                  GestureDetector(
                    onTap: () => askAI(_ctrl.text),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(colors: [Color(0xFF0056D2), Color(0xFF00A896)]),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.send, color: Colors.white, size: 20),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}