# 🛸 SIH Disaster-Response Drone System - Person 2 Ground Station & Backend

![License](https://img.shields.io/badge/SIH-Disaster%20Response-blue)
![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20Express%20%7C%20React%20%7C%20Leaflet%20%7C%20SQLite-emerald)

## 📌 System Role & Responsibility
This repository contains **PERSON 2's** codebase for the Smart India Hackathon (SIH) Disaster-Response Drone Software System.

- **Person 1** owns: Dataset preparation, YOLO AI model training, Raspberry Pi drone payload, and camera detection event generation.
- **Person 2 (THIS REPOSITORY)** owns: Backend API ingestion, SQLite database storage, WebSocket real-time streaming, Ground Station web interface, interactive GIS map, live alert banner, optical evidence viewer, and mission audit history.

---

## 🏗️ Project Architecture & Directory Structure

```
person 2/
├── backend/
│   ├── api/
│   │   ├── middleware.js          # Ingestion validation & error handler
│   │   └── routes.js              # REST endpoints (POST /api/events, GET /api/events, health)
│   ├── database/
│   │   ├── db.js                  # SQLite database wrapper & connection manager
│   │   ├── drone_events.db        # SQLite database file (auto-generated)
│   │   └── schema.sql             # SQL table definitions and indexes
│   ├── models/
│   │   └── eventModel.js          # Data access layer & aggregate KPI statistics
│   ├── services/
│   │   ├── mockEvidenceService.js # Dynamic optical telemetry SVG evidence synthesis
│   │   └── websocketService.js    # WebSockets server for real-time UI streaming
│   ├── uploads/                   # Media & evidence uploads storage directory
│   └── server.js                  # Main server entrypoint (HTTP + WebSockets)
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AlertBanner.jsx    # Critical high-priority alert highlight banner
│   │   │   ├── EventFeed.jsx      # Real-time incident table with search & filtering
│   │   │   ├── EventMap.jsx       # Interactive Leaflet GIS map with custom glowing pins
│   │   │   ├── EvidenceModal.jsx  # High-tech evidence lightbox & drone telemetry viewer
│   │   │   ├── Header.jsx         # Command center top navbar with WS status & sound toggle
│   │   │   ├── MissionHistory.jsx # Mission audit history log & CSV/JSON exporter
│   │   │   ├── ReceiverStatus.jsx # Person 1 RPi Wi-Fi & LoRa network connection panel
│   │   │   └── StatsOverview.jsx  # KPI metric cards & hazard class breakdown
│   │   ├── services/
│   │   │   ├── api.js            # REST API client
│   │   │   └── websocket.js      # WebSocket client with auto-reconnect
│   │   ├── utils/
│   │   │   └── hazardUtils.js    # Color tokens, icons, and audio alert chime
│   │   ├── App.jsx                # Main Ground Station workspace view
│   │   ├── index.css              # Custom tactical emergency command center CSS
│   │    font-mono main.jsx               # React entrypoint
│   ├── index.html                 # HTML template with fonts & Leaflet styling
│   ├── package.json
│   └── vite.config.js             # Vite config with backend API proxy
│
├── mock/
│   └── event_generator/
│       └── generator.js           # CLI mock event generator for testing
│
├── docs/
│   ├── API_CONTRACT.md            # Complete API & payload schema specification
│   └── RASPBERRY_PI_INTEGRATION.md# Guide & Python code snippets for Person 1
│
├── .env                           # Environment configuration
├── package.json                   # Root monorepo scripts
└── README.md                      # System documentation
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18+ or v24+
- **npm**: v9+ or v11+

### 1. Install Dependencies
Run the command below in the root folder to install all backend and frontend dependencies:
```bash
npm run setup
```

### 2. Start the Backend API & WebSockets Server
```bash
npm run dev:backend
```
*The backend starts at `http://localhost:5000` and `ws://localhost:5000/ws`.*

### 3. Start the Ground Station Frontend Web App
Open a second terminal window:
```bash
npm run dev:frontend
```
*The Ground Station web UI starts at `http://localhost:3000`.*

---

---

## 📻 Running the Physical LoRa Serial Receiver Bridge

When physical LoRa USB/UART receiver hardware is connected to the Ground Station laptop:

```bash
# Node.js Serial Receiver Bridge:
SERIAL_PORT=COM3 BAUD_RATE=9600 npm run bridge:lora

# Python Serial Receiver Bridge:
SERIAL_PORT=COM3 BAUD_RATE=9600 npm run bridge:lora:py
```

*The bridge script opens the specified serial port, parses line-delimited JSON packets from Person 1's LoRa receiver, and forwards them to `POST /api/events/lora` on the backend.*

---

## 🧪 Automated End-to-End Hardware & Software Test Suites

Verify event ingestion, LoRa ➔ Wi-Fi merging, and database deduplication logic:

### 1. Test C: LoRa ➔ Wi-Fi Event Merge Test
Simulates sending a LoRa telemetry packet first (`EVT-MERGE-xxxx`), followed 3s later by a Wi-Fi packet with attached image evidence for the SAME `event_id`:
```bash
npm run test:merge
```

### 2. Test D: Duplicate Retry / Idempotency Test
Simulates sending the exact same LoRa telemetry packet 3 times in succession to verify that only ONE database record and ONE map marker are created:
```bash
npm run test:duplicate
```

### 3. Continuous Telemetry Stream:
Emits a new detection event every 4 seconds continuously to demonstrate live WebSocket map and feed updates:
```bash
npm run mock:stream
```

---

## 📡 Person 1 (Raspberry Pi) Integration

Person 1 can send detection events over Wi-Fi to your server's IP address on port `5000`:

### Example API Request (Wi-Fi POST `/api/events`):
```bash
curl -X POST "http://<SERVER-IP>:5000/api/events" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "EVT-00125",
    "hazard": "fire",
    "confidence": 0.91,
    "priority": "HIGH",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "altitude": 42.5,
    "timestamp": "2026-09-01T14:32:18",
    "image_path": "events/EVT-00125/image.jpg"
  }'
```

### Example Success Response (`201 Created`):
```json
{
  "success": true,
  "message": "Event ingested, stored in database, and broadcasted via WebSockets",
  "data": {
    "event_id": "EVT-00125",
    "hazard": "fire",
    "hazard_code": 2,
    "confidence": 0.91,
    "priority": "HIGH",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "altitude": 42.5,
    "timestamp": "2026-09-01T14:32:18.000Z",
    "image_path": "/uploads/evidence/EVT-00125.svg",
    "channel": "WIFI",
    "status": "UNRESOLVED",
    "created_at": "2026-09-01T14:32:18.123Z"
  }
}
```

Detailed Python scripts and LoRa integration guides are located in [`docs/RASPBERRY_PI_INTEGRATION.md`](file:///c:/Users/Admin/Desktop/person%202/docs/RASPBERRY_PI_INTEGRATION.md).

---

## 🗄️ Database Setup & Schema
- **Database Engine**: SQLite with Write-Ahead Logging (WAL) enabled for high concurrent read/write throughput.
- **Auto-Initialization**: The database file `backend/database/drone_events.db` is created automatically on backend boot using `backend/database/schema.sql`.
- **Modular Data Layer**: All SQL queries are encapsulated in `backend/models/eventModel.js`, making it trivial to swap to PostgreSQL or MySQL later if required.

---

## 📊 Summary of Hazard Classes
| Hazard Code | String Name | Priority Default | Marker Accent Color |
| :---: | :--- | :---: | :--- |
| **0** | `flood` | HIGH | Cyan (`#06b6d4`) |
| **1** | `smoke` | MEDIUM | Slate (`#9ca3af`) |
| **2** | `fire` | HIGH | Red (`#ef4444`) |
| **3** | `debris` | MEDIUM | Amber (`#f59e0b`) |
| **4** | `landslide` | HIGH | Lime (`#84cc16`) |
| **5** | `person` | HIGH | Purple (`#a855f7`) |

---

## 📝 Assumptions & Hardware Dependencies
1. **Mock Evidence Generation**: When Person 1 sends a payload without an image binary, Person 2's backend automatically synthesizes an SVG optical image overlay with telemetry data so Ground Station operators can test evidence viewing.
2. **Network Reachability**: Ground Station laptop and Raspberry Pi must be on the same local network subnet or reachable over a VPN / public IP.
3. **Hardware Testing Remaining**: Physical LoRa UART module serial baud rate connection with RPi when physical hardware arrives.
