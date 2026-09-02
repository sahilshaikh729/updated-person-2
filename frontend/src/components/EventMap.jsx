import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Eye, MapPin, Layers, Maximize2 } from 'lucide-react';
import { getHazardConfig, PRIORITY_CONFIG } from '../utils/hazardUtils';

/**
 * Custom SVG DivIcon builder for map markers
 */
function createCustomMarkerIcon(event) {
  const hazardCfg = getHazardConfig(event.hazard);
  const prioCfg = PRIORITY_CONFIG[event.priority] || PRIORITY_CONFIG.LOW;
  const isHigh = event.priority === 'HIGH';

  const html = `
    <div class="custom-map-marker ${isHigh ? 'high-prio' : ''}" style="color: ${hazardCfg.color}; border-color: ${prioCfg.color};">
      <div style="font-weight: bold; font-size: 11px; font-family: monospace;">
        ${hazardCfg.label.charAt(0)}
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-icon-wrapper',
    html: html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
}

/**
 * Controller to auto-pan or fit bounds on new events
 */
function MapAutoFit({ events }) {
  const map = useMap();
  useEffect(() => {
    if (!events || events.length === 0) return;
    const validCoords = events.filter(e => typeof e.latitude === 'number' && typeof e.longitude === 'number');
    if (validCoords.length === 0) return;

    const bounds = L.latLngBounds(validCoords.map(e => [e.latitude, e.longitude]));
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15, animate: true });
  }, [events.length]);
  return null;
}

export default function EventMap({ events, selectedEvent, onSelectEvent }) {
  const defaultCenter = [18.5204, 73.8567];
  const mapRef = useRef(null);

  return (
    <div className="tactical-panel flex flex-col h-full relative overflow-hidden">
      
      {/* Map Panel Header */}
      <div className="tactical-panel-header flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            LIVE GEO-TAGGED DISASTER MAP
          </h2>
          <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60 font-bold">
            {events.length} GEO PINS
          </span>
        </div>
        
        {/* Map Legend */}
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> CRITICAL/HIGH
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> MEDIUM
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> LOW
          </span>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="flex-1 w-full min-h-[380px] relative z-10">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
          ref={mapRef}
        >
          {/* Dark Mode CartoDB Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <MapAutoFit events={events} />

          {events.map((evt) => {
            const hazardCfg = getHazardConfig(evt.hazard);
            const prioCfg = PRIORITY_CONFIG[evt.priority] || PRIORITY_CONFIG.LOW;

            return (
              <Marker
                key={evt.event_id}
                position={[evt.latitude, evt.longitude]}
                icon={createCustomMarkerIcon(evt)}
              >
                <Popup>
                  <div className="p-1 font-mono text-slate-200 text-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1 mb-1.5">
                      <span className="font-bold text-sm" style={{ color: hazardCfg.color }}>
                        {hazardCfg.label}
                      </span>
                      <span className="px-1.5 py-0.5 text-[9px] rounded font-bold" style={{ backgroundColor: prioCfg.bg, color: prioCfg.color }}>
                        {evt.priority}
                      </span>
                    </div>

                    <div className="text-[11px] space-y-0.5 mb-2.5">
                      <div><strong>ID:</strong> {evt.event_id}</div>
                      <div><strong>Confidence:</strong> {(evt.confidence * 100).toFixed(0)}%</div>
                      <div><strong>GPS:</strong> {evt.latitude.toFixed(5)}°, {evt.longitude.toFixed(5)}°</div>
                      <div><strong>Altitude:</strong> {evt.altitude}m</div>
                      <div><strong>Channel:</strong> {evt.channel}</div>
                      <div><strong>Timestamp:</strong> {new Date(evt.timestamp).toLocaleTimeString()}</div>
                    </div>

                    <button
                      onClick={() => onSelectEvent(evt)}
                      className="w-full flex items-center justify-center gap-1 py-1 px-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> INSPECT EVIDENCE
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

    </div>
  );
}
