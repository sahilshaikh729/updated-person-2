const { run, get, all } = require('../database/db');

// Standard hazard mapping
const HAZARD_MAP = {
    'flood': 0,
    'smoke': 1,
    'fire': 2,
    'debris': 3,
    'landslide': 4,
    'person': 5
};

const REVERSE_HAZARD_MAP = {
    0: 'flood',
    1: 'smoke',
    2: 'fire',
    3: 'debris',
    4: 'landslide',
    5: 'person'
};

/**
 * Standardize hazard name and code
 */
function parseHazard(input) {
    if (typeof input === 'number') {
        const hazardName = REVERSE_HAZARD_MAP[input] || 'person';
        return { name: hazardName, code: input };
    }
    if (typeof input === 'string') {
        const lower = input.trim().toLowerCase();
        if (HAZARD_MAP.hasOwnProperty(lower)) {
            return { name: lower, code: HAZARD_MAP[lower] };
        }
        // If it's a numeric string like "2"
        const num = parseInt(lower, 10);
        if (!isNaN(num) && REVERSE_HAZARD_MAP.hasOwnProperty(num)) {
            return { name: REVERSE_HAZARD_MAP[num], code: num };
        }
    }
    return { name: 'person', code: 5 };
}

/**
 * Idempotently insert or merge event in database
 */
async function upsertEvent(data) {
    const eventId = data.event_id || `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const existing = await getEventById(eventId);

    const { name: hazardName, code: hazardCode } = data.hazard 
        ? parseHazard(data.hazard) 
        : (existing ? { name: existing.hazard, code: existing.hazard_code } : parseHazard('person'));

    const confidence = (data.confidence !== undefined && data.confidence !== null && !isNaN(parseFloat(data.confidence)))
        ? parseFloat(data.confidence)
        : (existing ? existing.confidence : 0.0);

    const priority = data.priority
        ? String(data.priority).toUpperCase()
        : (existing ? existing.priority : 'LOW');

    const latitude = (data.latitude !== undefined && data.latitude !== null && !isNaN(parseFloat(data.latitude)))
        ? parseFloat(data.latitude)
        : (existing ? existing.latitude : 0.0);

    const longitude = (data.longitude !== undefined && data.longitude !== null && !isNaN(parseFloat(data.longitude)))
        ? parseFloat(data.longitude)
        : (existing ? existing.longitude : 0.0);

    const altitude = (data.altitude !== undefined && data.altitude !== null && !isNaN(parseFloat(data.altitude)))
        ? parseFloat(data.altitude)
        : (existing ? existing.altitude : 0.0);

    const timestamp = data.timestamp || (existing ? existing.timestamp : new Date().toISOString());

    // Image logic: Do NOT overwrite an existing valid image path with NULL or empty string!
    let imagePath = existing ? existing.image_path : null;
    if (data.image_path && String(data.image_path).trim().length > 0) {
        // Upgrade synthetic SVG or null to new real uploaded image path
        imagePath = data.image_path;
    }

    // Channel logic: If existing was LORA and incoming is WIFI, upgrade channel to WIFI
    let channel = (data.channel || 'WIFI').toUpperCase();
    if (existing) {
        if (existing.channel === 'WIFI' || channel === 'WIFI') {
            channel = 'WIFI';
        }
    }

    // Preserve existing operational status & incident commander notes unless explicitly provided
    const status = data.status 
        ? String(data.status).toUpperCase() 
        : (existing ? existing.status : 'UNRESOLVED');
    
    const notes = data.notes !== undefined ? data.notes : (existing ? existing.notes : null);

    if (!existing) {
        // First-time INSERT
        const sql = `
            INSERT INTO events (
                event_id, hazard, hazard_code, confidence, priority,
                latitude, longitude, altitude, timestamp, image_path,
                channel, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            eventId, hazardName, hazardCode, confidence, priority,
            latitude, longitude, altitude, timestamp, imagePath,
            channel, status, notes
        ];

        await run(sql, params);
    } else {
        // Idempotent UPDATE / MERGE
        const sql = `
            UPDATE events SET
                hazard = ?,
                hazard_code = ?,
                confidence = ?,
                priority = ?,
                latitude = ?,
                longitude = ?,
                altitude = ?,
                timestamp = ?,
                image_path = ?,
                channel = ?,
                status = ?,
                notes = ?
            WHERE event_id = ?
        `;

        const params = [
            hazardName, hazardCode, confidence, priority,
            latitude, longitude, altitude, timestamp, imagePath,
            channel, status, notes, eventId
        ];

        await run(sql, params);
    }

    return getEventById(eventId);
}

/**
 * Backward compatible alias for upsertEvent
 */
async function createEvent(data) {
    return upsertEvent(data);
}

/**
 * Attach or update evidence image for an existing event
 */
async function attachImageToEvent(eventId, imagePath) {
    const existing = await getEventById(eventId);
    if (!existing) return null;

    const sql = `UPDATE events SET image_path = ?, channel = 'WIFI' WHERE event_id = ?`;
    await run(sql, [imagePath, eventId]);
    return getEventById(eventId);
}


/**
 * Get single event by ID
 */
async function getEventById(eventId) {
    const sql = `SELECT * FROM events WHERE event_id = ?`;
    return await get(sql, [eventId]);
}

/**
 * Get events with optional filtering, search, sorting and pagination
 */
async function getEvents({ hazard, priority, search, channel, startDate, endDate, limit = 100, offset = 0 } = {}) {
    let sql = `SELECT * FROM events WHERE 1=1`;
    const params = [];

    if (hazard) {
        const { name } = parseHazard(hazard);
        sql += ` AND hazard = ?`;
        params.push(name);
    }

    if (priority) {
        sql += ` AND priority = ?`;
        params.push(priority.toUpperCase());
    }

    if (channel) {
        sql += ` AND channel = ?`;
        params.push(channel.toUpperCase());
    }

    if (startDate) {
        sql += ` AND timestamp >= ?`;
        params.push(startDate);
    }

    if (endDate) {
        sql += ` AND timestamp <= ?`;
        params.push(endDate);
    }

    if (search) {
        sql += ` AND (event_id LIKE ? OR hazard LIKE ? OR priority LIKE ? OR notes LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    sql += ` ORDER BY timestamp DESC, created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const rows = await all(sql, params);

    // Get total count for pagination metadata
    let countSql = `SELECT COUNT(*) as total FROM events WHERE 1=1`;
    const countParams = params.slice(0, params.length - 2); // Exclude LIMIT and OFFSET
    
    // Adjust countSql to match filters
    if (hazard) countSql += ` AND hazard = ?`;
    if (priority) countSql += ` AND priority = ?`;
    if (channel) countSql += ` AND channel = ?`;
    if (startDate) countSql += ` AND timestamp >= ?`;
    if (endDate) countSql += ` AND timestamp <= ?`;
    if (search) countSql += ` AND (event_id LIKE ? OR hazard LIKE ? OR priority LIKE ? OR notes LIKE ?)`;

    const totalRow = await get(countSql, countParams);

    return {
        events: rows,
        total: totalRow ? totalRow.total : rows.length,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10)
    };
}

/**
 * Update event status (e.g. UNRESOLVED, ACKNOWLEDGED, RESOLVED)
 */
async function updateEventStatus(eventId, status, notes = null) {
    let sql = `UPDATE events SET status = ?`;
    const params = [status.toUpperCase()];

    if (notes !== null) {
        sql += `, notes = ?`;
        params.push(notes);
    }

    sql += ` WHERE event_id = ?`;
    params.push(eventId);

    await run(sql, params);
    return getEventById(eventId);
}

/**
 * Get aggregate metrics and summary stats for Ground Station Dashboard
 */
async function getStats() {
    const totalRow = await get(`SELECT COUNT(*) as total FROM events`);
    const highPriorityRow = await get(`SELECT COUNT(*) as count FROM events WHERE priority = 'HIGH' AND status != 'RESOLVED'`);
    const channelRows = await all(`SELECT channel, COUNT(*) as count FROM events GROUP BY channel`);
    const hazardRows = await all(`SELECT hazard, COUNT(*) as count FROM events GROUP BY hazard`);
    const priorityRows = await all(`SELECT priority, COUNT(*) as count FROM events GROUP BY priority`);
    const latestEvent = await get(`SELECT * FROM events ORDER BY timestamp DESC LIMIT 1`);

    const channelBreakdown = { WIFI: 0, LORA: 0 };
    channelRows.forEach(r => channelBreakdown[r.channel] = r.count);

    const hazardBreakdown = { flood: 0, smoke: 0, fire: 0, debris: 0, landslide: 0, person: 0 };
    hazardRows.forEach(r => hazardBreakdown[r.hazard] = r.count);

    const priorityBreakdown = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    priorityRows.forEach(r => priorityBreakdown[r.priority] = r.count);

    return {
        total_events: totalRow ? totalRow.total : 0,
        active_high_priority: highPriorityRow ? highPriorityRow.count : 0,
        channel_breakdown: channelBreakdown,
        hazard_breakdown: hazardBreakdown,
        priority_breakdown: priorityBreakdown,
        latest_event: latestEvent || null
    };
}

module.exports = {
    parseHazard,
    createEvent,
    upsertEvent,
    attachImageToEvent,
    getEventById,
    getEvents,
    updateEventStatus,
    getStats,
    HAZARD_MAP,
    REVERSE_HAZARD_MAP
};
