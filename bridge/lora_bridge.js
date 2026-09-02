/**
 * =============================================================================
 * SIH Disaster-Response Drone System - Person 2 Ground Station
 * Physical LoRa Receiver Serial Bridge Script (Node.js)
 * =============================================================================
 * Usage:
 *   node bridge/lora_bridge.js
 *
 * Environment Variables:
 *   SERIAL_PORT : Serial port name (Default: 'COM3' or '/dev/ttyUSB0')
 *   BAUD_RATE   : Baud rate (Default: 9600)
 *   BACKEND_URL : Backend endpoint (Default: 'http://localhost:5000/api/events/lora')
 */

const http = require('http');
const os = require('os');

const SERIAL_PORT_NAME = process.env.SERIAL_PORT || (os.platform() === 'win32' ? 'COM3' : '/dev/ttyUSB0');
const BAUD_RATE = parseInt(process.env.BAUD_RATE || '9600', 10);
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api/events/lora';
const IS_SIMULATION = process.argv.includes('--simulate') || process.env.SIMULATE === 'true';

let SerialPort = null;
let ReadlineParser = null;

try {
  const serialport = require('serialport');
  SerialPort = serialport.SerialPort;
  ReadlineParser = require('@serialport/parser-readline').ReadlineParser;
} catch (e) {
  // Optional dependency check
}

function processLine(lineStr) {
  const lineClean = lineStr.trim();
  if (!lineClean) return;

  console.log(`\n[PACKET RECEIVED] Raw input: ${lineClean}`);

  let packet;
  try {
    packet = JSON.parse(lineClean);
    console.log(`[PACKET PARSED] Event ID: ${packet.event_id || 'AUTO'} | Hazard: ${packet.hazard} | Lat/Lng: (${packet.latitude}, ${packet.longitude})`);
  } catch (err) {
    console.error(`❌ [MALFORMED PACKET] Failed to parse JSON: ${err.message}`);
    return;
  }

  // Validate required fields
  if (!packet.hazard || packet.latitude === undefined || packet.longitude === undefined) {
    console.warn(`⚠️ [INVALID PAYLOAD] Missing required fields 'hazard', 'latitude', or 'longitude'`);
    return;
  }

  // Forward payload to Express Backend
  const payloadStr = JSON.stringify(packet);
  const parsedUrl = new URL(BACKEND_URL);

  const reqOptions = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || 80,
    path: parsedUrl.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payloadStr)
    }
  };

  const req = http.request(reqOptions, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`✅ [PACKET FORWARDED] Backend HTTP ${res.statusCode}: ${body}`);
      } else {
        console.error(`❌ [BACKEND ERROR] Backend HTTP ${res.statusCode}: ${body}`);
      }
    });
  });

  req.on('error', (err) => {
    console.error(`❌ [BACKEND ERROR] Failed to reach backend endpoint (${BACKEND_URL}): ${err.message}`);
  });

  req.write(payloadStr);
  req.end();
}

function main() {
  console.log('=============================================================================');
  printHeader();
  console.log('=============================================================================\n');

  if (IS_SIMULATION) {
    console.log('💡 [SIMULATION MODE ACTIVE] STDIN line listener connected. Type or pipe JSON lines below:\n');
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (data) => {
      const lines = data.split('\n');
      lines.forEach(processLine);
    });
    return;
  }

  if (!SerialPort) {
    console.log('⚠️ [RECEIVER STATUS] Node.js "serialport" module is not installed.');
    console.log('   👉 For physical USB/UART LoRa hardware, install: npm install serialport');
    console.log('   👉 For simulation mode, run: npm run bridge:lora:sim\n');
    return;
  }

  try {
    console.log(`🔌 Attempting serial connection to [${SERIAL_PORT_NAME}] at ${BAUD_RATE} baud...`);
    const port = new SerialPort({ path: SERIAL_PORT_NAME, baudRate: BAUD_RATE });
    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

    port.on('open', () => {
      console.log(`✅ [RECEIVER CONNECTED] Successfully listening on ${SERIAL_PORT_NAME}`);
      console.log('   Ready for incoming LoRa packet frames from Person 1 drone...\n');
    });

    parser.on('data', processLine);

    port.on('close', () => {
      console.log(`❌ [RECEIVER DISCONNECTED] Serial port closed.`);
    });

    port.on('error', (err) => {
      console.error(`❌ [RECEIVER ERROR] Serial error on ${SERIAL_PORT_NAME}: ${err.message}`);
    });

  } catch (err) {
    console.error(`❌ [RECEIVER INITIALIZATION ERROR] ${err.message}`);
  }
}

function printHeader() {
  if (IS_SIMULATION) {
    console.log('📡 SIH DRONE GROUND STATION - LORA SERIAL RECEIVER BRIDGE [SIMULATION MODE]');
    console.log(`  Input Source  : STDIN (Piped / Interactive JSON lines)`);
    console.log(`  Target Backend: ${BACKEND_URL}`);
  } else {
    console.log('📡 SIH DRONE GROUND STATION - PHYSICAL LORA SERIAL RECEIVER BRIDGE (NODE.JS)');
    console.log(`  Serial Port  : ${SERIAL_PORT_NAME}`);
    console.log(`  Baud Rate    : ${BAUD_RATE}`);
    console.log(`  Target Backend: ${BACKEND_URL}`);
  }
}

main();
