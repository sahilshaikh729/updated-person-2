const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const eventModel = require('../models/eventModel');
const { validateWiFiEvent, validateLoRaEvent } = require('./middleware');
const { broadcast, getConnectedClientCount } = require('../services/websocketService');

// Multer storage configuration for RPi image uploads
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, `event-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * Health Check Endpoint
 * GET /api/health
 */
router.get('/health', async (req, res, next) => {
    try {
        const stats = await eventModel.getStats();
        res.json({
            status: 'HEALTHY',
            system: 'SIH Disaster Response Drone Ground Station Backend',
            role: 'Person 2 - Ground Station API & Consumer',
            timestamp: new Date().toISOString(),
            uptime_seconds: process.uptime(),
            websocket_clients: getConnectedClientCount(),
            database: {
                status: 'CONNECTED',
                total_events_stored: stats.total_events
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * Dashboard & System Summary Metrics
 * GET /api/stats
 */
router.get('/stats', async (req, res, next) => {
    try {
        const stats = await eventModel.getStats();
        res.json(stats);
    } catch (err) {
        next(err);
    }
});

/**
 * Event Ingestion via Wi-Fi (Primary RPi Endpoint with LoRa Merge & Deduplication)
 * POST /api/events
 */
router.post('/events', upload.single('image'), validateWiFiEvent, async (req, res, next) => {
    try {
        const payload = req.body;

        // Handle uploaded image file if present
        if (req.file) {
            payload.image_path = `/uploads/${req.file.filename}`;
        }

        // Idempotent upsert (create or merge with existing LoRa event)
        const updatedEvent = await eventModel.upsertEvent(payload);

        // Broadcast real-time update over WebSocket to all Ground Station clients
        broadcast('EVENT_CREATED', updatedEvent);

        res.status(200).json({
            success: true,
            message: 'Event processed, stored/merged in database, and broadcasted via WebSockets',
            data: updatedEvent
        });
    } catch (err) {
        next(err);
    }
});

/**
 * Lightweight Event Ingestion via LoRa Interface (with Deduplication)
 * POST /api/events/lora
 */
router.post('/events/lora', validateLoRaEvent, async (req, res, next) => {
    try {
        const payload = req.body;

        // Idempotent upsert (create or update telemetry without overwriting existing Wi-Fi image)
        const updatedEvent = await eventModel.upsertEvent(payload);

        // Broadcast real-time update
        broadcast('EVENT_CREATED', updatedEvent);

        res.status(200).json({
            success: true,
            message: 'LoRa telemetry frame processed, stored/merged, and broadcasted',
            channel: 'LORA',
            data: updatedEvent
        });
    } catch (err) {
        next(err);
    }
});

/**
 * Explicit Image Attachment Endpoint for Existing Event
 * PATCH /api/events/:event_id/image
 */
router.patch('/events/:event_id/image', upload.single('image'), async (req, res, next) => {
    try {
        const eventId = req.params.event_id;
        let imagePath = req.body.image_path;

        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
        }

        if (!imagePath) {
            return res.status(400).json({
                error: 'BAD_REQUEST',
                message: 'No image file uploaded or image_path specified.'
            });
        }

        const updated = await eventModel.attachImageToEvent(eventId, imagePath);
        if (!updated) {
            return res.status(404).json({
                error: 'EVENT_NOT_FOUND',
                message: `Event with ID '${eventId}' was not found.`
            });
        }

        broadcast('EVENT_CREATED', updated);

        res.json({
            success: true,
            message: `Attached image evidence to event ${eventId}`,
            data: updated
        });
    } catch (err) {
        next(err);
    }
});

/**
 * Fetch List of Events with Filtering & Search
 * GET /api/events
 */
router.get('/events', async (req, res, next) => {
    try {
        const { hazard, priority, search, channel, startDate, endDate, limit, offset } = req.query;
        const result = await eventModel.getEvents({
            hazard,
            priority,
            search,
            channel,
            startDate,
            endDate,
            limit: limit ? parseInt(limit, 10) : 100,
            offset: offset ? parseInt(offset, 10) : 0
        });

        res.json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * Fetch Single Event Details
 * GET /api/events/:event_id
 */
router.get('/events/:event_id', async (req, res, next) => {
    try {
        const eventId = req.params.event_id;
        const event = await eventModel.getEventById(eventId);

        if (!event) {
            return res.status(404).json({
                error: 'EVENT_NOT_FOUND',
                message: `Event with ID '${eventId}' was not found.`
            });
        }

        res.json(event);
    } catch (err) {
        next(err);
    }
});

/**
 * Update Event Status (Acknowledge / Resolve)
 * PATCH /api/events/:event_id/status
 */
router.patch('/events/:event_id/status', async (req, res, next) => {
    try {
        const eventId = req.params.event_id;
        const { status, notes } = req.body;

        if (!status || !['UNRESOLVED', 'ACKNOWLEDGED', 'RESOLVED'].includes(status.toUpperCase())) {
            return res.status(400).json({
                error: 'BAD_REQUEST',
                message: 'Field "status" must be one of: UNRESOLVED, ACKNOWLEDGED, RESOLVED'
            });
        }

        const updatedEvent = await eventModel.updateEventStatus(eventId, status, notes);

        if (!updatedEvent) {
            return res.status(404).json({
                error: 'EVENT_NOT_FOUND',
                message: `Event with ID '${eventId}' was not found.`
            });
        }

        // Broadcast status change
        broadcast('EVENT_STATUS_UPDATED', updatedEvent);

        res.json({
            success: true,
            message: `Event ${eventId} status updated to ${status}`,
            data: updatedEvent
        });
    } catch (err) {
        next(err);
    }
});



module.exports = router;
