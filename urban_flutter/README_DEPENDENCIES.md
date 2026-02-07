# Urban Flutter Dependencies & Libraries Guide

इस दस्तावेज़ में **urban_flutter** प्रोजेक्ट में इस्तेमाल की गई सभी प्रमुख Libraries और Dependencies की जानकारी दी गई है। इसमें बताया गया है कि हर Library का काम क्या है और इस प्रोजेक्ट में उसे किस तरह इस्तेमाल किया गया है।

---

## 1. Core & UI Framework (बुनियादी ढांचे)

### `flutter` (sdk)
- **काम:** यह Flutter का मुख्य SDK है जिसका इस्तेमाल Apps बनाने के लिए किया जाता है।
- **यहाँ इस्तेमाल:** पूरे Application का UI और logic इसी पर आधारित है।

### `cupertino_icons`
- **काम:** iOS स्टाइल के icons प्रदान करता है।
- **यहाँ इस्तेमाल:** App में विभिन्न जगहों पर Icons दिखाने के लिए।

### `google_fonts`
- **काम:** Google Fonts को आसानी से इस्तेमाल करने की सुविधा देता है।
- **यहाँ इस्तेमाल:** `login_screen.dart`, `dashboard.dart` और अन्य UI screens में कस्टम Fonts (जैसे Inter, Roboto) के लिए।

---

## 2. State Management (डेटा प्रबंधन)

### `provider`
- **काम:** App के अलग-अलग हिस्सों में डेटा शेयर करने और UI को अपडेट करने के लिए।
- **यहाँ इस्तेमाल:** `city_monitor_provider.dart` और `main.dart` में App का state मैनेज करने के लिए। यह सुनिश्चित करता है कि डेटा बदलने पर UI अपने आप अपडेट हो जाए।

---

## 3. Network & API (इंटरनेट और डेटा)

### `http` & `http_parser`
- **काम:** Backend API से डेटा मंगाने और भेजने (GET, POST requests) के लिए।
- **यहाँ इस्तेमाल:** `api_service.dart` में server के साथ कम्युनिकेट करने के लिए (जैसे Login करना, शिकायतों की लिस्ट मंगाना)।

### `socket_io_client`
- **काम:** Real-time (बिना पेज रिफ्रेश किए) डेटा ट्रांसफर के लिए।
- **यहाँ इस्तेमाल:** `socket_service.dart` में real-time updates और notifications के लिए।

---

## 4. Maps & Location (मैप और लोकेशन)

### `geolocator` & `geocoding`
- **काम:** User की सही location (GPS) पाने और उसे एड्रेस में बदलने के लिए।
- **यहाँ इस्तेमाल:** `citizen_sos_screen.dart` और `grievance_map_screen.dart` में user की लोकेशन ट्रैक करने के लिए।

### `flutter_map` & `latlong2`
- **काम:** Map दिखाने और उस पर पॉइंट्स (Markers) लगाने के लिए।
- **यहाँ इस्तेमाल:** `monitor_map_view.dart` में शहर का नक्शा दिखाने के लिए।

---

## 5. Media & Assets (मीडिया और इमेजेज)

### `image_picker`
- **काम:** Gallery या Camera से फोटो चुनने के लिए।
- **यहाँ इस्तेमाल:** शिकायत दर्ज करते वक्त फोटो अपलोड करने के लिए (`citizen_form.dart`)।

### `video_player` & `chewie`
- **काम:** App के अंदर वीडियो चलाने के लिए।
- **यहाँ इस्तेमाल:** शिकायतों के साथ अपलोड किए गए वीडियो को देखने के लिए (`citizen_complaint_detail_screen.dart`)।

### `cached_network_image`
- **काम:** इंटरनेट से इमेजेज को डाउनलोड करके सेव (Cache) रखना ताकि वो बार-बार लोड न हों।
- **यहाँ इस्तेमाल:** User profiles और dashboard पर इमेजेज को फ़ास्ट लोड करने के लिए।

---

## 6. Charts & Visualization (चार्ट्स और ग्राफ़िक्स)

### `fl_chart` & `syncfusion_flutter_charts`
- **काम:** सुंदर चार्ट्स (Line, Bar, Pie charts) दिखाने के लिए।
- **यहाँ इस्तेमाल:** `budget_tracker_screen.dart` और `monitor_trends_view.dart` में शहर का डेटा ग्राफ के रूप में दिखाने के लिए।

---

## 7. Animations (एनीमेशन)

### `lottie`
- **काम:** JSON-based सुंदर एनीमेशन चलाने के लिए।
- **यहाँ इस्तेमाल:** Logo animations और loading screen में।

### `shimmer`
- **काम:** डेटा लोड होने के दौरान "Skeleton" एनीमेशन दिखाने के लिए।
- **यहाँ इस्तेमाल:** जब लिस्ट लोड हो रही होती है, तो एक खाली चमकती हुई पट्टी दिखाने के लिए।

### `animate_do` & `animated_text_kit`
- **काम:** बटन और टेक्स्ट में कूल एनीमेशन डालने के लिए।
- **यहाँ इस्तेमाल:** App को "Premium" लुक देने के लिए जगह-जगह इस्तेमाल किया गया है।

---

## 8. Utils & Features (अन्य सुविधाएं)

### `intl`
- **काम:** तारीख (Date), समय (Time) और नंबर (Currency) को फॉर्मेट करने के लिए।
- **यहाँ इस्तेमाल:** तारीखें दिखाने और बजट कैलकुलेशन में।

### `speech_to_text` & `flutter_tts`
- **काम:** आवाज़ को टेक्स्ट में बदलने (STT) और टेक्स्ट को आवाज़ में बदलने (TTS) के लिए।
- **यहाँ इस्तेमाल:** `chat_bot_screen.dart` में AI Voice interaction के लिए।

### `url_launcher`
- **काम:** Phone, Email या Web Browser खोलने के लिए।
- **यहाँ इस्तेमाल:** किसी शिकायतकर्ता को फ़ोन करने या लिंक खोलने के लिए।

### `flutter_local_notifications`
- **काम:** मोबाइल की स्क्रीन पर Notification (Alert) दिखाने के लिए।
- **यहाँ इस्तेमाल:** `local_notification_service.dart` में ज़रूरी अलर्ट्स देने के लिए।

### `shared_preferences`
- **काम:** मोबाइल में छोटा-मोटा डेटा परमानेंटली सेव करने के लिए।
- **यहाँ इस्तेमाल:** Login token और user settings को सेव करने के लिए।

### `permission_handler`
- **काम:** Camera, Location और Microphone की परमिशन माँगने के लिए।
- **यहाँ इस्तेमाल:** ज़रूरी फीचर्स इस्तेमाल करने से पहले user से अनुमति लेने के लिए।

---
