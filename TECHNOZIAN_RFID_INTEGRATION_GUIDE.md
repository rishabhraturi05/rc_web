# Technozian RFID Registration Box — Embedded Integration Specification

**Target:** ESP32 / ESP8266 RFID Hardware Team  
**Event:** Technozian  
**Platform:** Robotics Club NITK Web App  

---

## 1. Quick Summary of What Happens After Hosting

When the website is hosted at `https://rc-nitw.org`:
1. **You do NOT need to change any code on the website.**
2. When you open `/addsecs/smashkarts` on the live site, the modal will **automatically show your live URL**:
   ```
   https://rc-nitw.org/api/technozian/scan
   ```
3. Because the site is live on the internet, the ESP box can connect to **any Wi-Fi** (campus Wi-Fi, mobile hotspot, etc.) and send scans directly to your database.

---

## 2. All Data the Embedded Team Needs From You

Give these exact details to the embedded developers:

| Parameter | Value | Notes |
| :--- | :--- | :--- |
| **HTTP Method** | `POST` | Must be POST |
| **Endpoint URL** | `https://rc-nitw.org/api/technozian/scan` | Replace with your live Vercel/custom domain |
| **Header: Content-Type** | `application/json` | Required |
| **Header: x-api-key** | `rc_technozian_rfid_2025` | Default secret key (or your custom `RFID_API_KEY` from Vercel env) |
| **Fallback URL** | `https://rc-nitw.org/api/rfid/scan` | Works identically as an alias |

---

## 3. Data We Expect the ESP to Send (Request Payload)

The ESP must send a JSON body with at least **one** identifier (`rollNo` or `rfidUid`):

### Standard JSON Payload:
```json
{
  "rollNo": "23BCS042",
  "rfidUid": "A3F291B0",
  "deviceId": "BOX_1"
}
```

### Field Breakdown:

| Field | Type | Required? | Description |
| :--- | :--- | :--- | :--- |
| **`rollNo`** | `string` | **Recommended** | The student roll number extracted from the card (e.g., `"23BCS042"`). Case-insensitive (server auto-converts to uppercase). |
| **`rfidUid`** | `string` | **Optional** (Required if no rollNo) | The 4-byte or 7-byte Hex UID of the RFID card (e.g., `"A3F291B0"`). If roll number cannot be read from card blocks, send this. |
| **`deviceId`** | `string` | **Optional** | Identifier of the scanner box (e.g. `"BOX_1"`, `"ENTRANCE_A"`). Defaults to `"BOX_1"`. |
| **`apiKey`** | `string` | **Optional** | You can send `"rc_technozian_rfid_2025"` here in the JSON body, or in the `x-api-key` header. Both work! |

> **Do you need to change anything in the data?**  
> * Only confirm with the embedded team: **Are they reading the Roll Number from the card memory sector, OR are they reading only the Card UID?**  
> * If they read **Roll Number**: They send `"rollNo": "23BCS042"`.  
> * If they read only **Card UID**: They send `"rfidUid": "A3F291B0"`. The backend automatically creates a placeholder `RFID_A3F291B0` which you can see in the admin table.

---

## 4. Responses the ESP Will Receive

The ESP code should read the HTTP response code to trigger LEDs and buzzers:

| HTTP Status Code | Meaning | Server Response Body | Recommended Hardware Feedback |
| :--- | :--- | :--- | :--- |
| **`201 Created`** | First-time registration successfully saved! | `{"success": true, "isRepeat": false, "message": "Registered successfully: 23BCS042"}` | **Green LED** ON for 1 sec + **1 short beep** |
| **`200 OK`** | Student was already registered! Repeat tap verified. | `{"success": true, "isRepeat": true, "message": "Already registered! Attendance confirmed for 23BCS042"}` | **Blue / Yellow LED** ON + **2 short beeps** |
| **`400 Bad Request`** | Missing both `rollNo` and `rfidUid`. | `{"success": false, "message": "Missing roll number or RFID UID"}` | **Red LED** 3 fast blinks |
| **`401 Unauthorized`** | Missing or incorrect `x-api-key`. | `{"success": false, "message": "Unauthorized: Invalid or missing API key"}` | **Red LED** ON for 2 sec + **long error beep** |
| **`500 Server Error`** | Database or server problem. | `{"success": false, "message": "Internal server error saving scan"}` | **Red LED** flashing |

---

## 5. Complete Arduino C++ Code for the Embedded Team

Here is the production-ready code with **HTTPS (SSL)** handling:

### For ESP32:
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// 1. Wi-Fi Configuration
const char* ssid     = "YOUR_WIFI_OR_HOTSPOT_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

// 2. Server Configuration (Live Robotics Club NITW domain)
const char* serverUrl = "https://rc-nitw.org/api/technozian/scan";
const char* apiKey    = "rc_technozian_rfid_2025";
const char* deviceId  = "BOX_1";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to Wi-Fi!");
}

void loop() {
  // Your RFID scanning logic here (e.g. MFRC522)
  // When a card is detected, call sendScanToWebsite:
  // sendScanToWebsite("23BCS042", "A3F291B0");
}

void sendScanToWebsite(String rollNo, String rfidUid) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi not connected!");
    return;
  }

  WiFiClientSecure client;
  client.setInsecure(); // Allows HTTPS without manually loading SSL root certificates

  HTTPClient http;
  if (http.begin(client, serverUrl)) {
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-api-key", apiKey);

    // Build JSON payload
    String payload = "{\"rollNo\":\"" + rollNo + "\",\"rfidUid\":\"" + rfidUid + "\",\"deviceId\":\"" + String(deviceId) + "\"}";

    Serial.println("Sending payload: " + payload);
    int httpResponseCode = http.POST(payload);

    if (httpResponseCode == 201) {
      Serial.println("[SUCCESS] New registration created!");
      // Turn on Green LED / 1 beep
    } else if (httpResponseCode == 200) {
      Serial.println("[INFO] Already registered, repeat scan confirmed.");
      // Turn on Blue LED / 2 beeps
    } else {
      Serial.printf("[ERROR] HTTP Error code: %d\n", httpResponseCode);
      String errorMsg = http.getString();
      Serial.println(errorMsg);
      // Turn on Red LED
    }

    http.end();
  } else {
    Serial.println("[ERROR] Unable to connect to host");
  }

  // 2-second debounce delay so one tap does not trigger multiple requests
  delay(2000);
}
```

---

## 6. Checklist & Tips for the Embedded Team

1. **SSL Insecure Mode (`client.setInsecure();`):**  
   Because live sites use `https://`, Arduino `HTTPClient` requires `client.setInsecure();` (as shown in the code). If omitted, the ESP will fail with error `-1` (SSL handshake failure).
2. **Debouncing (Delay):**  
   Students hold cards against the scanner for ~1-2 seconds. Without a delay (`delay(2000)`), the RFID reader might trigger 5-10 requests in a fraction of a second.
3. **Hotspot Compatibility:**  
   If college Wi-Fi has a captive portal (login page), use a phone mobile hotspot for the ESP box during the event.
