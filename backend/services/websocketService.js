const WebSocket = require('ws');

let wss = null;

/**
 * Initialize WebSocket Server attached to HTTP Server
 */
function initWebSocketServer(server) {
    wss = new WebSocket.Server({ server, path: '/ws' });

    console.log('✅ WebSocket server initialized on path /ws');

    wss.on('connection', (ws, req) => {
        const clientIp = req.socket.remoteAddress;
        console.log(`🔌 Ground Station client connected via WS [${clientIp}]`);

        // Send initial connection handshake confirmation
        ws.send(JSON.stringify({
            type: 'CONNECTED',
            message: 'Connected to SIH Ground Station WebSocket Stream',
            timestamp: new Date().toISOString()
        }));

        ws.isAlive = true;

        ws.on('pong', () => {
            ws.isAlive = true;
        });

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                if (data.type === 'PING') {
                    ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
                }
            } catch (err) {
                // Ignore malformed WS frames
            }
        });

        ws.on('close', () => {
            console.log(`🔌 Ground Station client disconnected [${clientIp}]`);
        });

        ws.on('error', (err) => {
            console.error('❌ WebSocket Client Error:', err.message);
        });
    });

    // Heartbeat ping interval to drop stale clients
    const heartbeatInterval = setInterval(() => {
        if (!wss) return;
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', () => {
        clearInterval(heartbeatInterval);
    });

    return wss;
}

/**
 * Broadcast payload to all active connected Ground Station UI clients
 */
function broadcast(type, payload) {
    if (!wss) {
        console.warn('⚠️ WebSocket server not initialized, broadcast skipped');
        return;
    }

    const frame = JSON.stringify({
        type,
        payload,
        timestamp: new Date().toISOString()
    });

    let clientCount = 0;
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(frame);
            clientCount++;
        }
    });

    console.log(`📡 Broadcasted WS event [${type}] to ${clientCount} active client(s)`);
}

/**
 * Get current connected client count
 */
function getConnectedClientCount() {
    if (!wss) return 0;
    let count = 0;
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) count++;
    });
    return count;
}

module.exports = {
    initWebSocketServer,
    broadcast,
    getConnectedClientCount
};
