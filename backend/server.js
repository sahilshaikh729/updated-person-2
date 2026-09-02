require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const os = require('os');

const { initDatabase } = require('./database/db');
const routes = require('./api/routes');
const { errorHandler } = require('./api/middleware');
const { initWebSocketServer } = require('./services/websocketService');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Enable CORS for all origins (Ground Station Web UI & external drone clients)
app.use(cors());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploaded evidence images
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Register API Routes
app.use('/api', routes);

// Centralized error handler
app.use(errorHandler);

// Helper to list local IP addresses for network connection setup
function getLocalIpAddresses() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const name of Object.keys(interfaces)) {
        for (const net of interfaces[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                addresses.push(net.address);
            }
        }
    }
    return addresses;
}

// Create HTTP server
const server = http.createServer(app);

// Attach WebSocket Server
initWebSocketServer(server);

// Initialize DB and start listening
initDatabase()
    .then(() => {
        server.listen(PORT, HOST, () => {
            const ips = getLocalIpAddresses();
            console.log('\n=============================================================');
            console.log('🚨 SIH DISASTER-RESPONSE DRONE GROUND STATION BACKEND RUNNING');
            console.log('   Role: Person 2 - Ground Station API & Consumer');
            console.log('=============================================================');
            console.log(`🌐 Local HTTP API:    http://localhost:${PORT}/api/health`);
            console.log(`📡 Local WebSockets:  ws://localhost:${PORT}/ws`);
            if (ips.length > 0) {
                console.log(`📶 Network Endpoint (For RPi / Person 1):`);
                ips.forEach(ip => {
                    console.log(`   👉 POST http://${ip}:${PORT}/api/events`);
                });
            }
            console.log('=============================================================\n');
        });
    })
    .catch((err) => {
        console.error('❌ Server startup failed due to database error:', err);
        process.exit(1);
    });

module.exports = { app, server };
