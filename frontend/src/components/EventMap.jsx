import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Eye, MapPin, Layers, Globe, Image, Navigation, Radio, CheckCircle2 } from 'lucide-react';
import { getHazardConfig, PRIORITY_CONFIG } from '../utils/hazardUtils';

/**
 * Custom DivIcon builder for live 🚁 DRONE POSITION Marker
 */
function createDroneMarkerIcon(dronePosition) {
  const heading = dronePosition?.heading || 0;
  const altitude = dronePosition?.altitude || 45;

  const html = `
    <div class="drone-map-marker" style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #0f172a;
      border: 2px solid #3b82f6;
      box-shadow: 0 0 16px rgba(59, 130, 246, 0.8);
      color: #60a5fa;
      cursor: pointer;
    ">
      <div style="transform: rotate(${heading}deg); transition: transform 0.3s ease;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
      </div>
      <div style="
        position: absolute;
        bottom: -16px;
        background: #1e3a8a;
        color: #93c5fd;
        font-family: 'Inter', sans-serif;
        font-size: 9px;
        font-weight: 700;
        padding: 1px 4px;
        border-radius: 4px;
        border: 1px solid #3b82f6;
        white-space: nowrap;
      ">
        DRONE ${altitude}m
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-drone-wrapper',
    html: html,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20]
  });
}

/**
 * Custom SVG DivIcon builder for map event markers
 */
function createCustomMarkerIcon(event, isSelected) {
  const isPerson = (event.hazard || '').toLowerCase() === 'person';
  const confPct = Math.round((event.confidence || 0) * 100);

  if (isPerson) {
    // Dedicated PERSON DETECTED Rescue Pin
    const html = `
      <div class="custom-person-pin ${isSelected ? 'selected-pin' : ''}" style="
        display: flex;
        align-items: center;
        gap: 5px;
        background: ${isSelected ? '#059669' : '#064e3b'};
        color: #34d399;
        border: 2px solid ${isSelected ? '#34d399' : '#10b981'};
        border-radius: 16px;
        padding: 3px 8px;
        box-shadow: ${isSelected ? '0 0 16px #10b981' : '0 4px 12px rgba(0,0,0,0.6)'};
        font-family: 'Inter', sans-serif;
        font-weight: 700;
        font-size: 11px;
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.2s ease;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>PERSON ${confPct}%</span>
      </div>
    `;

    return L.divIcon({
      className: 'custom-leaflet-person-wrapper',
      html: html,
      iconSize: [110, 28],
      iconAnchor: [55, 14],
      popupAnchor: [0, -14]
    });
  }

  // Other hazard markers
  const hazardCfg = getHazardConfig(event.hazard);
  const prioCfg = PRIORITY_CONFIG[event.priority] || PRIORITY_CONFIG.LOW;

  const html = `
    <div class="custom-map-marker" style="color: ${hazardCfg.color}; border-color: ${prioCfg.color}; font-family: 'Inter', sans-serif;">
      <div style="font-weight: bold; font-size: 11px;">
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
 * Intelligent collision offset helper to prevent visual marker overlapping
 */
function applyCollisionOffsets(events) {
  const coordGroups = new Map();
  
  return events.map((evt) => {
    const roundedKey = `${evt.latitude?.toFixed(4)}_${evt.longitude?.toFixed(4)}`;
    const index = coordGroups.get(roundedKey) || 0;
    coordGroups.set(roundedKey, index + 1);

    if (index === 0) return evt;

    // Apply minor radial displacement offset (~15m per index)
    const angle = (index * 60) * (Math.PI / 180);
    const radius = 0.00018 * index;
    const offsetLat = evt.latitude + radius * Math.sin(angle);
    const offsetLng = evt.longitude + radius * Math.cos(angle);

    return {
      ...evt,
      renderLatitude: offsetLat,
      renderLongitude: offsetLng
    };
  });
}

/**
 * Controller to auto-pan or fit bounds on new events or single selected event
 */
function MapAutoFit({ events, selectedEvent, mapFilter }) {
  const map = useMap();
  useEffect(() => {
    if (selectedEvent && typeof selectedEvent.latitude === 'number' && typeof selectedEvent.longitude === 'number') {
      map.setView([selectedEvent.latitude, selectedEvent.longitude], 16, { animate: true });
      return;
    }
    if (events && events.length > 0) {
      const validCoords = events.filter(e => typeof e.latitude === 'number' && typeof e.longitude === 'number');
      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords.map(e => [e.latitude, e.longitude]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15, animate: true });
      }
    }
  }, [events.length, selectedEvent?.event_id, mapFilter]);
  return null;
}

export default function EventMap({ 
  events, 
  selectedEvent, 
  onSelectEvent, 
  mapFilter = 'ALL',
  onClearFilter,
  dronePosition = null,
  isOnline = true 
}) {
  const [mapViewMode, setMapViewMode] = useState('MAP'); // 'MAP' or 'SATELLITE'

  // Filter events based on active category, priority level, or single event selection
  const filteredEvents = useMemo(() => {
    // If single event isolated mode
    if (mapFilter === 'SINGLE_EVENT' && selectedEvent) {
      return events.filter(e => e.event_id === selectedEvent.event_id);
    }
    // Priority group filters
    if (mapFilter === 'HIGH_PRIORITY') {
      return events.filter(e => e.priority === 'HIGH');
    }
    if (mapFilter === 'MEDIUM_PRIORITY') {
      return events.filter(e => e.priority === 'MEDIUM');
    }
    if (mapFilter === 'LOW_PRIORITY') {
      return events.filter(e => e.priority === 'LOW');
    }
    // Hazard category filter mode
    if (mapFilter && mapFilter !== 'ALL') {
      return events.filter(e => (e.hazard || '').toLowerCase() === mapFilter.toLowerCase());
    }
    return events;
  }, [events, mapFilter, selectedEvent]);

  // Apply collision offsets to close-proximity markers
  const renderEvents = useMemo(() => applyCollisionOffsets(filteredEvents), [filteredEvents]);

  const defaultCenter = selectedEvent && typeof selectedEvent.latitude === 'number' 
    ? [selectedEvent.latitude, selectedEvent.longitude] 
    : (dronePosition ? [dronePosition.latitude, dronePosition.longitude] : [27.7172, 85.3240]);
  
  const mapRef = useRef(null);

  // Configure tile URL and native max zoom based on view mode
  let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  let tileAttribution = '&copy; OpenStreetMap & CartoDB';
  let maxNativeZoom = 19;

  if (mapViewMode === 'SATELLITE') {
    tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    tileAttribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    maxNativeZoom = 18;
  }

  return (
    <div className="tactical-panel flex flex-col h-full relative overflow-hidden bg-[#080b13] border border-slate-800/80 font-sans">
      
      {/* Map Panel Header */}
      <div className="tactical-panel-header flex items-center justify-between font-sans flex-wrap gap-2 py-1.5 px-3 bg-[#0c101c] border-b border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            LIVE MISSION MAP
          </h2>

          {/* Active Filter Indicator Badge */}
          {mapFilter && mapFilter !== 'ALL' && (
            <div className="flex items-center gap-1 bg-amber-950/80 border border-amber-600/60 px-2 py-0.5 rounded text-[10px] font-bold text-amber-300">
              <span>FILTER: {mapFilter === 'SINGLE_EVENT' ? `ISOLATED (${selectedEvent?.event_id || 'EVENT'})` : mapFilter.toUpperCase()}</span>
              {onClearFilter && (
                <button
                  onClick={onClearFilter}
                  className="ml-1 text-amber-400 hover:text-white underline cursor-pointer"
                >
                  [ SHOW ALL ]
                </button>
              )}
            </div>
          )}

          {mapFilter === 'ALL' && (
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded font-semibold">
              SHOWING ALL ACTIVE ({filteredEvents.length})
            </span>
          )}
        </div>
        
        {/* Basemap Switcher & Legend */}
        <div className="flex items-center gap-3">
          
          {/* Tactical Layer Switcher: [ MAP ] [ SATELLITE ] */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px] font-sans">
            <button
              onClick={() => setMapViewMode('MAP')}
              className={`px-2 py-0.5 rounded font-bold transition-all flex items-center gap-1 ${
                mapViewMode === 'MAP'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe className="w-3 h-3" /> MAP
            </button>
            <button
              onClick={() => setMapViewMode('SATELLITE')}
              className={`px-2 py-0.5 rounded font-bold transition-all flex items-center gap-1 ${
                mapViewMode === 'SATELLITE'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Image className="w-3 h-3" /> SATELLITE
            </button>
          </div>

          {/* Map Legend */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400 font-sans">
            <span className="flex items-center gap-1 text-blue-400 font-bold">
              🚁 DRONE
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              👤 PERSON
            </span>
          </div>

        </div>
      </div>

      {/* Map Canvas */}
      <div className="flex-1 w-full min-h-[420px] relative z-10">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            key={mapViewMode}
            attribution={tileAttribution}
            url={tileUrl}
            maxNativeZoom={maxNativeZoom}
            maxZoom={20}
          />

          <MapAutoFit events={filteredEvents} selectedEvent={selectedEvent} mapFilter={mapFilter} />

          {/* Live Drone GPS Position Marker */}
          {dronePosition && typeof dronePosition.latitude === 'number' && typeof dronePosition.longitude === 'number' && (
            <Marker
              position={[dronePosition.latitude, dronePosition.longitude]}
              icon={createDroneMarkerIcon(dronePosition)}
            >
              <Popup>
                <div className="p-1 font-sans text-slate-200 text-xs">
                  <div className="font-bold text-blue-400 flex items-center gap-1 border-b border-slate-700 pb-1 mb-1">
                    🚁 LIVE DRONE TELEMETRY
                  </div>
                  <div><strong>Lat:</strong> {dronePosition.latitude.toFixed(5)}°</div>
                  <div><strong>Lng:</strong> {dronePosition.longitude.toFixed(5)}°</div>
                  <div><strong>Altitude:</strong> {dronePosition.altitude || 45}m</div>
                  <div><strong>Heading:</strong> {dronePosition.heading || 0}°</div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Event Detections Markers (With Collision Displacement & Pin Select) */}
          {renderEvents.map((evt) => {
            const isSelected = selectedEvent && selectedEvent.event_id === evt.event_id;
            const lat = evt.renderLatitude || evt.latitude;
            const lng = evt.renderLongitude || evt.longitude;
            const hazardCfg = getHazardConfig(evt.hazard);

            return (
              <Marker
                key={evt.event_id}
                position={[lat, lng]}
                icon={createCustomMarkerIcon(evt, isSelected)}
                eventHandlers={{
                  click: () => onSelectEvent(evt)
                }}
              >
                <Popup>
                  <div className="p-1 font-sans text-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1">
                      <span className="font-bold text-emerald-400">
                        PERSON DETECTED
                      </span>
                      <span className="text-slate-400 font-mono">{(evt.confidence * 100).toFixed(0)}% Match</span>
                    </div>

                    <div className="text-[11px] text-slate-300">
                      <div><strong>GPS:</strong> {evt.latitude.toFixed(5)}°, {evt.longitude.toFixed(5)}°</div>
                      <div><strong>Time:</strong> {new Date(evt.timestamp).toLocaleTimeString()}</div>
                      <div><strong>Event ID:</strong> {evt.event_id}</div>
                    </div>

                    <button
                      onClick={() => onSelectEvent(evt)}
                      className="w-full mt-1.5 flex items-center justify-center gap-1 py-1 px-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all cursor-pointer"
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
