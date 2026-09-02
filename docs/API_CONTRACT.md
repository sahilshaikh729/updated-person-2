# SIH Disaster Response System - API Contract Documentation
**Person 1 (Event Producer / RPi Payload) ➔ Person 2 (Event Consumer / Ground Station)**

---

## 1. Overview & Data Flow
Person 1's Raspberry Pi drone system detects hazards and posts structured detection events to Person 2's Ground Station backend. 

```
[ Raspberry Pi / Drone Payload ]
               │
        ┌──────┴──────────────────────────┐
        │  POST /api/events (Wi-Fi)       │
        │  POST /api/events/lora (LoRa)   │
        └──────┬──────────────────────────┘
               ▼
[ Ground Station Backend (Port 5000) ]
        ├── Database Storage (SQLite)
        └── WebSocket Broadcast ➔ Ground Station Web UI
```

---

## 2. Ingestion Endpoints

### A. Primary Wi-Fi Ingestion Endpoint
- **URL**: `POST http://<SERVER-IP>:5000/api/events`
- **Content-Type**: `application/json` (or `multipart/form-data` with `image` file)
- **Description**: Full detection payload, including optical camera evidence path or attached image file.

#### JSON Request Schema:
```json
{
  "event_id": "EVT-00125",
  "hazard": "fire",
  "confidence": 0.91,
  "priority": "HIGH",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "altitude": 42.5,
  "timestamp": "2026-09-01T14:32:18",
  "image_path": "events/EVT-00125/image.jpg"
}
```

#### Field Specifications:
| Field | Type | Required | Allowed Values / Format | Description |
| :--- | :--- | :--- | :--- | :--- |
| `event_id` | String | No (Auto) | Unique string (e.g. `EVT-00125`) | Unique incident identifier |
| `hazard` | String / Int | **Yes** | `"flood"` (0), `"smoke"` (1), `"fire"` (2), `"debris"` (3), `"landslide"` (4), `"person"` (5) | Hazard class string or numerical index |
| `confidence` | Float | **Yes** | `0.0` to `1.0` | AI model detection confidence score |
| `priority` | String | No (Default) | `"HIGH"`, `"MEDIUM"`, `"LOW"` | Emergency severity level |
| `latitude` | Float | **Yes** | `-90.0` to `90.0` | GPS Latitude in decimal degrees |
| `longitude` | Float | **Yes** | `-180.0` to `180.0` | GPS Longitude in decimal degrees |
| `altitude` | Float | No | `>= 0.0` (meters) | Drone altitude above ground level |
| `timestamp` | String | No | ISO-8601 String | Capture timestamp |
| `image_path` | String | No | Path string | Relative image evidence filepath |

#### Multipart Image Upload:
If transmitting an actual image file from the Raspberry Pi camera:
- Set `Content-Type: multipart/form-data`
- Attach image binary under key `image`
- Provide standard JSON fields as form fields or a `data` JSON string field.

#### Success Response (`201 Created`):
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

---

### B. Lightweight LoRa Telemetry Endpoint
- **URL**: `POST http://<SERVER-IP>:5000/api/events/lora`
- **Content-Type**: `application/json`
- **Description**: Lightweight telemetry packet transmitted when Wi-Fi is unavailable. Excludes image binaries to fit LoRa bandwidth constraints.

#### JSON Request Schema:
```json
{
  "event_id": "EVT-00126",
  "hazard": "landslide",
  "confidence": 0.88,
  "priority": "HIGH",
  "latitude": 18.5310,
  "longitude": 73.8420,
  "altitude": 55.0,
  "timestamp": "2026-09-01T14:35:00"
}
```

---

## 3. Ground Station Query Endpoints

### A. List & Filter Events
`GET /api/events`
- **Query Parameters**:
  - `hazard`: Filter by class (`fire`, `flood`, `smoke`, `debris`, `landslide`, `person`)
  - `priority`: Filter by priority (`HIGH`, `MEDIUM`, `LOW`)
  - `channel`: Filter by ingestion channel (`WIFI`, `LORA`)
  - `search`: Free text search on Event ID or notes
  - `startDate`, `endDate`: ISO timestamp range filtering
  - `limit`: Number of records (default `100`)
  - `offset`: Pagination offset (default `0`)

### B. Event Details
`GET /api/events/:event_id`

### C. Update Incident Status
`PATCH /api/events/:event_id/status`
- **Body**: `{ "status": "ACKNOWLEDGED", "notes": "Dispatched Rescue Team Alpha" }`

### D. System Health Check
`GET /api/health`

---

## 4. WebSocket Real-Time Frame Contract
- **Endpoint**: `ws://<SERVER-IP>:5000/ws`
- **Message Types**:
  - `EVENT_CREATED`: Emitted immediately when a new event arrives via Wi-Fi or LoRa.
  - `EVENT_STATUS_UPDATED`: Emitted when an operator updates incident status.
