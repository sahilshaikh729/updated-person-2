# Raspberry Pi Drone Integration Guide (For Person 1)
**Step-by-Step Instructions for Connecting the Drone Payload to Person 2's Ground Station**

---

## 1. Network Configuration
1. Connect both Person 2's Ground Station Laptop and Person 1's Raspberry Pi to the same Wi-Fi router / mobile hotspot.
2. Note Person 2's IP Address (displayed on server launch, e.g. `10.127.213.119` or `192.168.1.5`).
3. Person 2's server listens on port **5000**.

---

## 2. Option A: Transmitting Over Wi-Fi (HTTP POST)

### Python Integration Snippet (Raspberry Pi):
Install dependencies on Raspberry Pi:
```bash
pip install requests
```

Create `drone_sender.py`:
```python
import requests
import json
from datetime import datetime

# Replace with Person 2's actual Ground Station IP address
GROUND_STATION_IP = "10.127.213.119"  
ENDPOINT = f"http://{GROUND_STATION_IP}:5000/api/events"

def send_detection_event(hazard_name, confidence, priority, lat, lng, alt, image_file_path=None):
    event_id = "EVT-" + datetime.now().strftime("%Y%m%d%H%M%S")
    
    payload = {
        "event_id": event_id,
        "hazard": hazard_name,  # "flood", "smoke", "fire", "debris", "landslide", "person"
        "confidence": float(confidence),
        "priority": priority,   # "HIGH", "MEDIUM", "LOW"
        "latitude": float(lat),
        "longitude": float(lng),
        "altitude": float(alt),
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        if image_file_path:
            # Send payload with actual camera image binary
            with open(image_file_path, 'rb') as img_file:
                files = {'image': img_file}
                response = requests.post(ENDPOINT, data=payload, files=files, timeout=5)
        else:
            # Send JSON payload only
            response = requests.post(ENDPOINT, json=payload, timeout=5)
            
        if response.status_code == 201:
            print(f"✅ Detection {event_id} sent successfully to Ground Station!")
            return True
        else:
            print(f"❌ Error {response.status_code}:", response.text)
            return False
            
    except Exception as e:
        print(f"⚠️ Transmission failed: {e}")
        return False

# Example Usage after YOLO inferencing loop:
if __name__ == "__main__":
    send_detection_event(
        hazard_name="fire",
        confidence=0.92,
        priority="HIGH",
        lat=18.5204,
        lng=73.8567,
        alt=42.5
    )
```

---

## 3. Option B: Transmitting Over LoRa (Lightweight Telemetry)

When Wi-Fi range is exceeded, transmit lightweight telemetry over LoRa serial relay to Person 2's Ground Receiver module:

### Physical Serial Line LoRa Packet Format (Person 1 -> Person 2):
Person 1's LoRa transmitter should send single-line JSON strings terminated by `\n` over UART serial:
```json
{"event_id": "EVT-100", "hazard": "fire", "confidence": 0.91, "priority": "HIGH", "latitude": 18.5204, "longitude": 73.8567, "altitude": 42.5, "timestamp": "2026-09-02T12:00:00Z"}
```

*Note: Do NOT send image binaries over LoRa. Transmit only the lightweight JSON object above.*

### Ground Receiver Bridge Setup (Person 2 Laptop):
Run Person 2's serial receiver bridge to read packets from USB/UART receiver and forward to backend:

```bash
# Python Receiver Bridge:
SERIAL_PORT=COM3 BAUD_RATE=9600 python bridge/lora_bridge.py

# Node.js Receiver Bridge:
SERIAL_PORT=COM3 BAUD_RATE=9600 npm run bridge:lora
```

---

## 4. LoRa ➔ Wi-Fi Event Merging & Deduplication Protocol

### Scenario: LoRa First, Wi-Fi Later
1. **LoRa Transmission**: RPi sends `EVT-100` over LoRa without an image.
   - Ground Station creates event record with `channel='LORA'` and generates thermal HUD SVG evidence.
   - Map immediately displays pin at `(18.5204, 73.8567)`.
2. **Wi-Fi Transmission**: When drone enters Wi-Fi range, RPi sends `EVT-100` over Wi-Fi attached with actual image file `fire.jpg`.
   - Backend performs **idempotent merge**: upgrades `channel` to `WIFI`, attaches `fire.jpg`, updates confidence score.
   - Dashboard **preserves the single incident** and updates the map pin without creating duplicate markers or SQL primary-key constraint errors.

### Offline Storage & Auto-Sync:
If both Wi-Fi and LoRa are temporarily out of range:
1. RPi saves failed payloads to local queue file (`/home/pi/offline_events.json`).
2. When Wi-Fi reconnects, RPi sends buffered payloads sequentially to `POST http://<SERVER-IP>:5000/api/events`.
3. Backend handles duplicate retries safely and idempotently.

---

## 5. End-to-End Hardware & Software Testing Protocol

Person 2 provides automated test suites to verify merge and deduplication software logic:

```bash
# Test A & B (Wi-Fi Ingest & LoRa Ingest):
npm run mock

# Test C (LoRa First -> Wi-Fi Later Event Merge):
npm run test:merge

# Test D (Duplicate Retries / Deduplication):
npm run test:duplicate
```

