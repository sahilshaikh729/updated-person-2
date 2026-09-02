const http = require('http');

// Target backend URL
const TARGET_HOST = process.env.BACKEND_HOST || 'localhost';
const TARGET_PORT = process.env.BACKEND_PORT || 5000;

// Base center location for realistic disaster simulation (Pune/Western Ghats region)
const BASE_LAT = 18.5204;
const BASE_LNG = 73.8567;

const HAZARD_CLASSES = [
    { name: 'flood', defaultPriority: 'HIGH' },
    { name: 'smoke', defaultPriority: 'MEDIUM' },
    { name: 'fire', defaultPriority: 'HIGH' },
    { name: 'debris', defaultPriority: 'MEDIUM' },
    { name: 'landslide', defaultPriority: 'HIGH' },
    { name: 'person', defaultPriority: 'HIGH' }
];

let eventCounter = Math.floor(Math.random() * 10000);

/**
 * Generate a single realistic mock event JSON payload adhering strictly to Person 1 API contract
 */
function generateMockEvent(forcedHazard = null, channel = 'WIFI') {
    eventCounter++;
    const hazardObj = forcedHazard 
        ? HAZARD_CLASSES.find(h => h.name === forcedHazard) || HAZARD_CLASSES[0]
        : HAZARD_CLASSES[Math.floor(Math.random() * HAZARD_CLASSES.length)];

    // Random jitter around base location (+/- 0.04 deg ~ 4km)
    const latOffset = (Math.random() - 0.5) * 0.08;
    const lngOffset = (Math.random() - 0.5) * 0.08;

    const lat = parseFloat((BASE_LAT + latOffset).toFixed(6));
    const lng = parseFloat((BASE_LNG + lngOffset).toFixed(6));
    const alt = parseFloat((30 + Math.random() * 85).toFixed(1));

    const confidence = parseFloat((0.68 + Math.random() * 0.30).toFixed(2));
    
    // Priorities
    const priorities = ['HIGH', 'MEDIUM', 'LOW'];
    const priority = (Math.random() < 0.6) ? hazardObj.defaultPriority : priorities[Math.floor(Math.random() * priorities.length)];

    const timestampStr = Date.now().toString().slice(-4);
    const eventId = `EVT-${timestampStr}-${String(eventCounter).padStart(4, '0')}`;
    const timestamp = new Date().toISOString();

    return {
        event_id: eventId,
        hazard: hazardObj.name,
        confidence: confidence,
        priority: priority,
        latitude: lat,
        longitude: lng,
        altitude: alt,
        timestamp: timestamp,
        channel: channel,
        image_path: `events/${eventId}/image.jpg` // Person 1 contract format
    };
}

/**
 * Send HTTP POST request to backend API
 */
function postEvent(eventData, endpoint = '/api/events') {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(eventData);

        const options = {
            hostname: TARGET_HOST,
            port: TARGET_PORT,
            path: endpoint,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsed = JSON.parse(body);
                        resolve(parsed);
                    } catch (e) {
                        resolve(body);
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.write(payload);
        req.end();
    });
}

/**
 * CLI Entry point
 */
async function main() {
    const args = process.argv.slice(2);
    const isStream = args.includes('--stream');
    const isLora = args.includes('--lora');
    const isTestMerge = args.includes('--test-merge');
    const isTestDuplicate = args.includes('--test-duplicate');
    const isSimulateSerial = args.includes('--simulate-serial');
    const intervalArgIdx = args.indexOf('--interval');
    const intervalMs = (intervalArgIdx !== -1 && args[intervalArgIdx + 1]) 
        ? parseInt(args[intervalArgIdx + 1], 10) 
        : 4000;

    const endpoint = isLora ? '/api/events/lora' : '/api/events';
    const channel = isLora ? 'LORA' : 'WIFI';

    console.log('\n============================================================');
    console.log('🛸 SIH DISASTER RESPONSE DRONE - MOCK EVENT GENERATOR');
    console.log(`   Target: http://${TARGET_HOST}:${TARGET_PORT}`);
    console.log('============================================================\n');

    // TEST C: LoRa -> Wi-Fi Event Merge Scenario
    if (isTestMerge) {
        console.log('🧪 RUNNING TEST C: LORA -> WI-FI EVENT MERGE SCENARIO');
        const eventId = `EVT-MERGE-${Date.now().toString().slice(-4)}`;
        const baseMock = generateMockEvent('fire', 'LORA');
        baseMock.event_id = eventId;
        delete baseMock.image_path; // LoRa payload has no image

        console.log(`\n📍 STEP 1: Transmitting lightweight LoRa packet for Event ID '${eventId}'...`);
        console.log(`   Payload: Hazard=${baseMock.hazard}, Pri=${baseMock.priority}, Lat=${baseMock.latitude}, Lng=${baseMock.longitude}`);
        try {
            const res1 = await postEvent(baseMock, '/api/events/lora');
            console.log(`✅ [LORA SUCCESS] Response: ${res1.message}`);
            console.log(`   👉 Ground station dashboard should now show event '${eventId}' on map with synthetic SVG evidence.`);
        } catch (err) {
            console.error(`❌ Step 1 failed:`, err.message);
            return;
        }

        console.log(`\n⏳ Waiting 3 seconds before Wi-Fi connection becomes available...`);
        await new Promise(r => setTimeout(r, 3000));

        console.log(`\n📶 STEP 2: Transmitting Wi-Fi packet for SAME Event ID '${eventId}' with attached image evidence...`);
        const wifiPayload = {
            ...baseMock,
            channel: 'WIFI',
            confidence: 0.96, // Updated confidence from closer Wi-Fi pass
            image_path: `/uploads/evidence/${eventId}-wifi-evidence.jpg`
        };

        try {
            const res2 = await postEvent(wifiPayload, '/api/events');
            console.log(`✅ [WI-FI MERGE SUCCESS] Response: ${res2.message}`);
            console.log(`\n🎉 TEST C VERIFICATION CHECKLIST:`);
            console.log(`   1. Database contains exactly 1 record for '${eventId}' (channel updated to WIFI).`);
            console.log(`   2. Dashboard map continues showing exactly 1 marker at (${baseMock.latitude}, ${baseMock.longitude}).`);
            console.log(`   3. Evidence lightbox now displays the attached Wi-Fi image evidence.\n`);
        } catch (err) {
            console.error(`❌ Step 2 failed:`, err.message);
        }
        return;
    }

    // TEST D: Duplicate Retry / Deduplication Scenario
    if (isTestDuplicate) {
        console.log('🧪 RUNNING TEST D: DUPLICATE RETRY / DEDUPLICATION SCENARIO');
        const eventId = `EVT-DUP-${Date.now().toString().slice(-4)}`;
        const dupMock = generateMockEvent('landslide', 'LORA');
        dupMock.event_id = eventId;

        console.log(`\n📍 Transmitting SAME LoRa packet '${eventId}' 3 times in succession...`);

        for (let i = 1; i <= 3; i++) {
            try {
                const res = await postEvent(dupMock, '/api/events/lora');
                console.log(`✅ Transmission #${i} Success: ${res.message}`);
            } catch (err) {
                console.error(`❌ Transmission #${i} Failed:`, err.message);
            }
            await new Promise(r => setTimeout(r, 800));
        }

        console.log(`\n🎉 TEST D VERIFICATION CHECKLIST:`);
        console.log(`   1. Backend responded with HTTP 200 OK (no Primary Key SQL constraint errors).`);
        console.log(`   2. Database contains exactly 1 record for '${eventId}'.`);
        console.log(`   3. Ground station dashboard shows exactly 1 incident marker on map.\n`);
        return;
    }

    // SIMULATE SERIAL LINE PRINT
    if (isSimulateSerial) {
        console.log('📡 SIMULATING RAW SERIAL PORT OUTPUT FOR LORA RECEIVER BRIDGE...');
        console.log('   Pipe this output into: node bridge/lora_bridge.js\n');
        for (let i = 0; i < 3; i++) {
            const mock = generateMockEvent(null, 'LORA');
            delete mock.image_path;
            console.log(JSON.stringify(mock));
        }
        return;
    }

    if (!isStream) {
        // Emit 1 initial sample event for each of the 6 hazard classes
        console.log('🚀 Emitting initial 6 hazard events burst...');
        for (const hazard of HAZARD_CLASSES) {
            const mock = generateMockEvent(hazard.name, channel);
            try {
                const res = await postEvent(mock, endpoint);
                console.log(`✅ Sent [${mock.hazard.toUpperCase()}] Event ID: ${mock.event_id} | Pri: ${mock.priority} | Lat: ${mock.latitude}, Lng: ${mock.longitude}`);
            } catch (err) {
                console.error(`❌ Failed to send event ${mock.event_id}:`, err.message);
            }
            await new Promise(r => setTimeout(r, 400));
        }
        console.log('\n🎉 Burst complete! Check your Ground Station dashboard.\n');
    } else {
        // Stream mode
        console.log(`📡 Starting continuous drone detection event stream (Press Ctrl+C to stop)...`);
        setInterval(async () => {
            const mock = generateMockEvent(null, channel);
            try {
                await postEvent(mock, endpoint);
                console.log(`[${new Date().toLocaleTimeString()}] 🛰️  Emitted ${mock.channel} event -> [${mock.hazard.toUpperCase()}] ${mock.event_id} (${mock.priority}) at (${mock.latitude}, ${mock.longitude})`);
            } catch (err) {
                console.error(`❌ Stream POST Error:`, err.message);
            }
        }, intervalMs);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    generateMockEvent,
    postEvent
};
