#!/usr/bin/env python3
"""
=============================================================================
SIH Disaster-Response Drone System - Person 2 Ground Station
Physical LoRa Receiver Serial Bridge Script (Python)
=============================================================================
Architecture:
  Raspberry Pi (Drone) -> LoRa Transmitter RF -> Ground LoRa Receiver ->
  USB / Serial / UART -> THIS SCRIPT -> HTTP POST /api/events/lora -> Express Backend

Usage:
  python bridge/lora_bridge.py

Environment Variables:
  SERIAL_PORT : Serial port name (Default: 'COM3' on Windows, '/dev/ttyUSB0' on Linux)
  BAUD_RATE   : Baud rate (Default: 9600)
  BACKEND_URL : Express API endpoint (Default: 'http://localhost:5000/api/events/lora')
"""

import os
import sys
import json
import time
import requests

try:
    import serial
except ImportError:
    print("❌ ERROR: 'pyserial' library is not installed.")
    print("👉 Install it using: pip install pyserial requests")
    sys.exit(1)

# Environment configuration with defaults
SERIAL_PORT = os.getenv("SERIAL_PORT", "COM3" if os.name == "nt" else "/dev/ttyUSB0")
BAUD_RATE = int(os.getenv("BAUD_RATE", "9600"))
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000/api/events/lora")

# Target backend connection timeout (seconds)
HTTP_TIMEOUT = 5

def validate_lora_packet(data):
    """
    Validate that the incoming JSON payload satisfies Person 1 LoRa API contract.
    """
    errors = []
    if not isinstance(data, dict):
        return False, ["Payload is not a valid JSON object"]

    if "hazard" not in data or data["hazard"] is None:
        errors.append("Missing required field 'hazard'")
    
    if "latitude" not in data or "longitude" not in data:
        errors.append("Missing required fields 'latitude' or 'longitude'")
    else:
        try:
            lat = float(data["latitude"])
            lng = float(data["longitude"])
            if not (-90 <= lat <= 90):
                errors.append(f"Latitude out of bounds: {lat}")
            if not (-180 <= lng <= 180):
                errors.append(f"Longitude out of bounds: {lng}")
        except (ValueError, TypeError):
            errors.append("Latitude and longitude must be valid floating point numbers")

    if errors:
        return False, errors
    return True, []

def process_serial_line(line_str):
    """
    Parse line string into JSON, validate fields, and post to backend API.
    """
    line_clean = line_str.strip()
    if not line_clean:
        return

    print(f"\n[PACKET RECEIVED] Raw input: {line_clean}")

    # Step 1: JSON Parsing
    try:
        packet = json.loads(line_clean)
        print(f"[PACKET PARSED] Event ID: {packet.get('event_id', 'AUTO')} | Hazard: {packet.get('hazard')} | Lat/Lng: ({packet.get('latitude')}, {packet.get('longitude')})")
    except Exception as e:
        print(f"❌ [MALFORMED PACKET] Failed to parse JSON: {e}")
        return

    # Step 2: Field Validation
    valid, validation_errors = validate_lora_packet(packet)
    if not valid:
        print(f"⚠️ [INVALID PAYLOAD] Packet failed validation rules: {', '.join(validation_errors)}")
        return

    # Step 3: Forward to Backend API
    try:
        response = requests.post(BACKEND_URL, json=packet, timeout=HTTP_TIMEOUT)
        if response.status_code in [200, 201]:
            print(f"✅ [PACKET FORWARDED] Backend HTTP {response.status_code}: {response.json().get('message')}")
        else:
            print(f"❌ [BACKEND ERROR] Backend HTTP {response.status_code}: {response.text}")
    except requests.exceptions.RequestException as req_err:
        print(f"❌ [BACKEND ERROR] Failed to reach backend endpoint ({BACKEND_URL}): {req_err}")

def main():
    print("=============================================================================")
    print("📡 SIH DRONE GROUND STATION - PHYSICAL LORA SERIAL RECEIVER BRIDGE")
    print("=============================================================================")
    print(f"  Role         : Person 2 Serial Hardware Bridge")
    print(f"  Serial Port  : {SERIAL_PORT}")
    print(f"  Baud Rate    : {BAUD_RATE}")
    print(f"  Target Backend: {BACKEND_URL}")
    print("=============================================================================\n")

    while True:
        try:
            print(f"🔌 Attempting serial connection to [{SERIAL_PORT}] at {BAUD_RATE} baud...")
            with serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=2) as ser:
                print(f"✅ [RECEIVER CONNECTED] Successfully listening on {SERIAL_PORT}")
                print("   Ready for incoming LoRa packet frames from Person 1 drone...\n")

                while True:
                    line = ser.readline()
                    if line:
                        try:
                            decoded = line.decode('utf-8', errors='replace')
                            process_serial_line(decoded)
                        except Exception as decode_err:
                            print(f"⚠️ [MALFORMED PACKET] Read error: {decode_err}")

        except serial.SerialException as s_err:
            print(f"❌ [RECEIVER DISCONNECTED] Serial port error on {SERIAL_PORT}: {s_err}")
            print("🔄 Retrying connection in 5 seconds... (Press Ctrl+C to cancel)")
            time.sleep(5)
        except KeyboardInterrupt:
            print("\n🛑 Bridge script terminated by user.")
            sys.exit(0)

if __name__ == "__main__":
    main()
