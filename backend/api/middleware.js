const { parseHazard } = require('../models/eventModel');

/**
 * Validate full Wi-Fi detection event payload
 */
function validateWiFiEvent(req, res, next) {
    let body = req.body || {};

    // If payload arrived via multipart form data with a 'data' JSON string field
    if (typeof body.data === 'string') {
        try {
            body = JSON.parse(body.data);
            req.body = body;
        } catch (e) {
            return res.status(400).json({
                error: 'BAD_REQUEST',
                message: 'Invalid JSON payload in "data" field'
            });
        }
    }

    const errors = [];

    // Hazard check
    if (body.hazard === undefined || body.hazard === null) {
        errors.push('Field "hazard" is required (string name or number 0..5)');
    } else {
        const { name } = parseHazard(body.hazard);
        if (!['flood', 'smoke', 'fire', 'debris', 'landslide', 'person'].includes(name)) {
            errors.push('Invalid "hazard" value. Must be one of: flood, smoke, fire, debris, landslide, person (or codes 0-5)');
        }
    }

    // Confidence check
    const conf = parseFloat(body.confidence);
    if (isNaN(conf) || conf < 0 || conf > 1) {
        errors.push('Field "confidence" must be a float between 0.0 and 1.0');
    }

    // Priority check
    if (body.priority) {
        const prio = String(body.priority).toUpperCase();
        if (!['HIGH', 'MEDIUM', 'LOW'].includes(prio)) {
            errors.push('Field "priority" must be one of: HIGH, MEDIUM, LOW');
        }
    } else {
        // Default based on hazard
        req.body.priority = (body.hazard === 'fire' || body.hazard === 2 || body.hazard === 'landslide' || body.hazard === 4) ? 'HIGH' : 'MEDIUM';
    }

    // Coordinates check
    const lat = parseFloat(body.latitude);
    const lng = parseFloat(body.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.push('Field "latitude" must be a valid number between -90 and 90');
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.push('Field "longitude" must be a valid number between -180 and 180');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'INVALID_EVENT_PAYLOAD',
            message: 'Validation failed for incoming event',
            details: errors
        });
    }

    // Set defaults if omitted
    req.body.altitude = parseFloat(body.altitude || 0.0);
    req.body.timestamp = body.timestamp || new Date().toISOString();
    req.body.channel = 'WIFI';

    next();
}

/**
 * Validate lightweight LoRa telemetry payload
 */
function validateLoRaEvent(req, res, next) {
    const body = req.body || {};
    const errors = [];

    if (body.hazard === undefined || body.hazard === null) {
        errors.push('Field "hazard" is required for LoRa payload');
    }

    const lat = parseFloat(body.latitude);
    const lng = parseFloat(body.longitude);

    if (isNaN(lat) || isNaN(lng)) {
        errors.push('Valid "latitude" and "longitude" are required for LoRa payload');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'INVALID_LORA_PAYLOAD',
            message: 'Validation failed for LoRa telemetry packet',
            details: errors
        });
    }

    req.body.confidence = parseFloat(body.confidence || 0.85);
    req.body.priority = (body.priority || 'HIGH').toUpperCase();
    req.body.altitude = parseFloat(body.altitude || 0.0);
    req.body.timestamp = body.timestamp || new Date().toISOString();
    req.body.channel = 'LORA';

    next();
}

/**
 * Central Error Handler
 */
function errorHandler(err, req, res, next) {
    console.error('❌ Server Error:', err.stack || err.message);
    res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: err.message || 'An unexpected error occurred'
    });
}

module.exports = {
    validateWiFiEvent,
    validateLoRaEvent,
    errorHandler
};
