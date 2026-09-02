const fs = require('fs');
const path = require('path');

const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
const evidenceDir = path.join(uploadsDir, 'evidence');

if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
}

/**
 * Generate a realistic SVG image evidence with visual bounding boxes, drone telemetry, and target highlight.
 */
function generateEvidenceSVG(event) {
    const { event_id, hazard, confidence, priority, latitude, longitude, altitude, timestamp } = event;
    const confPct = Math.round(confidence * 100);

    const hazardColors = {
        fire: { bg: '#3b0764', accent: '#ef4444', text: '#fca5a5' },
        smoke: { bg: '#1f2937', accent: '#9ca3af', text: '#e5e7eb' },
        flood: { bg: '#0c4a6e', accent: '#06b6d4', text: '#a5f3fc' },
        debris: { bg: '#451a03', accent: '#f59e0b', text: '#fde68a' },
        landslide: { bg: '#365314', accent: '#84cc16', text: '#d9f99d' },
        person: { bg: '#4c1d95', accent: '#a855f7', text: '#e9d5ff' }
    };

    const scheme = hazardColors[hazard] || hazardColors.person;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" style="background-color: #030712; font-family: monospace, sans-serif;">
  <defs>
    <!-- Background Grid Pattern -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    </pattern>
    <!-- Crosshair gradient -->
    <radialGradient id="grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${scheme.accent}" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.9" />
    </radialGradient>
  </defs>

  <!-- Ground Thermal / Tactical Base -->
  <rect width="800" height="600" fill="url(#grid)" />
  <circle cx="400" cy="300" r="240" fill="url(#grad)" />

  <!-- Drone Thermal Silhouette Simulation -->
  <g opacity="0.6">
    <ellipse cx="400" cy="300" rx="140" ry="90" fill="${scheme.bg}" stroke="${scheme.accent}" stroke-width="2" stroke-dasharray="6,4" />
    <path d="M 260 300 Q 400 210 540 300 T 260 300" fill="none" stroke="${scheme.accent}" stroke-width="1.5" />
  </g>

  <!-- AI Object Detection Bounding Box -->
  <g transform="translate(310, 210)">
    <rect x="0" y="0" width="180" height="150" fill="none" stroke="${scheme.accent}" stroke-width="3" stroke-dasharray="20,5" />
    
    <!-- Target Bounding Box Corners -->
    <path d="M 0 25 L 0 0 L 25 0" fill="none" stroke="${scheme.accent}" stroke-width="5" />
    <path d="M 155 0 L 180 0 L 180 25" fill="none" stroke="${scheme.accent}" stroke-width="5" />
    <path d="M 180 125 L 180 150 L 155 150" fill="none" stroke="${scheme.accent}" stroke-width="5" />
    <path d="M 25 150 L 0 150 L 0 125" fill="none" stroke="${scheme.accent}" stroke-width="5" />

    <!-- Tag Header -->
    <rect x="0" y="-30" width="180" height="30" fill="${scheme.accent}" />
    <text x="8" y="-10" fill="#000000" font-size="14" font-weight="bold" letter-spacing="1">AI DET: ${hazard.toUpperCase()} (${confPct}%)</text>
  </g>

  <!-- Drone HUD Reticle -->
  <g stroke="#22c55e" stroke-width="1.5" opacity="0.8">
    <!-- Central Crosshair -->
    <line x1="380" y1="300" x2="420" y2="300" />
    <line x1="400" y1="280" x2="400" y2="320" />
    <circle cx="400" cy="300" r="10" fill="none" />

    <!-- Corner Brackets -->
    <path d="M 30 50 L 30 30 L 50 30" fill="none" />
    <path d="M 750 30 L 770 30 L 770 50" fill="none" />
    <path d="M 770 550 L 770 570 L 750 570" fill="none" />
    <path d="M 50 570 L 30 570 L 30 550" fill="none" />
  </g>

  <!-- Top Telemetry Header Bar -->
  <rect x="0" y="0" width="800" height="40" fill="rgba(15, 23, 42, 0.95)" />
  <text x="20" y="25" fill="#38bdf8" font-size="14" font-weight="bold">UAV-OPTICAL-CAM #01</text>
  <text x="260" y="25" fill="#e2e8f0" font-size="13">EVENT ID: <tspan fill="#f59e0b">${event_id}</tspan></text>
  <text x="540" y="25" fill="#22c55e" font-size="13">PRIORITY: <tspan fill="${priority === 'HIGH' ? '#ef4444' : '#38bdf8'}">${priority}</tspan></text>

  <!-- Bottom Telemetry Footer Overlay -->
  <rect x="0" y="550" width="800" height="50" fill="rgba(15, 23, 42, 0.95)" />
  <text x="20" y="572" fill="#94a3b8" font-size="12">LAT: <tspan fill="#ffffff">${latitude.toFixed(6)}°</tspan></text>
  <text x="180" y="572" fill="#94a3b8" font-size="12">LON: <tspan fill="#ffffff">${longitude.toFixed(6)}°</tspan></text>
  <text x="340" y="572" fill="#94a3b8" font-size="12">ALT: <tspan fill="#ffffff">${altitude}m</tspan></text>
  <text x="470" y="572" fill="#94a3b8" font-size="12">TIME: <tspan fill="#ffffff">${timestamp}</tspan></text>

  <!-- Watermark -->
  <text x="700" y="582" fill="rgba(255,255,255,0.3)" font-size="10" text-anchor="end">SIH DRONE GS v1.0</text>
</svg>`;

    return svg;
}

/**
 * Ensure an evidence image file exists for the event. If missing or relative, generate mock SVG file.
 */
function ensureEventEvidence(event) {
    if (!event.event_id) return null;

    const fileName = `${event.event_id}.svg`;
    const filePath = path.join(evidenceDir, fileName);
    const relativeUrl = `/uploads/evidence/${fileName}`;

    if (!fs.existsSync(filePath)) {
        const svgContent = generateEvidenceSVG(event);
        fs.writeFileSync(filePath, svgContent, 'utf8');
    }

    return relativeUrl;
}

module.exports = {
    generateEvidenceSVG,
    ensureEventEvidence
};
