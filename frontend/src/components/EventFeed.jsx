import React from 'react';
import { Search, Eye, Clock } from 'lucide-react';
import { getHazardConfig, PRIORITY_CONFIG } from '../utils/hazardUtils';

export default function EventFeed({ 
  events, 
  filters, 
  setFilters, 
  onSelectEvent, 
  onAcknowledgeStatus 
}) {
  return (
    <div className="tactical-panel flex flex-col h-full font-sans">
      
      {/* Table Header & Controls Bar */}
      <div className="tactical-panel-header flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 font-mono">
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            RECENT INCIDENTS & TELEMETRY STREAM
          </h2>
          <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-bold">
            {events.length} RECORDS
          </span>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Search Input */}
          <div className="relative flex-1 sm:w-40">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-500" />
            <input
              type="text"
              placeholder="Search ID/Notes..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-2 py-1 text-slate-200 text-[11px] focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Hazard Filter */}
          <select
            value={filters.hazard || ''}
            onChange={(e) => setFilters({ ...filters, hazard: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-[11px] focus:outline-none focus:border-cyan-500"
          >
            <option value="">ALL HAZARDS</option>
            <option value="fire">FIRE</option>
            <option value="smoke">SMOKE</option>
            <option value="flood">FLOOD</option>
            <option value="debris">DEBRIS</option>
            <option value="landslide">LANDSLIDE</option>
            <option value="person">PERSON</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority || ''}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-[11px] focus:outline-none focus:border-cyan-500"
          >
            <option value="">ALL PRIORITIES</option>
            <option value="HIGH">HIGH ONLY</option>
            <option value="MEDIUM">MEDIUM ONLY</option>
            <option value="LOW">LOW ONLY</option>
          </select>

          {/* Channel Filter */}
          <select
            value={filters.channel || ''}
            onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-[11px] focus:outline-none focus:border-cyan-500"
          >
            <option value="">ALL CHANNELS</option>
            <option value="WIFI">WI-FI</option>
            <option value="LORA">LORA</option>
          </select>

        </div>

      </div>

      {/* Incident Feed Table */}
      <div className="flex-1 overflow-y-auto min-h-[160px] max-h-[260px]">
        <table className="w-full text-left font-mono border-collapse">
          <thead className="sticky top-0 bg-[#090d18] border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider z-20">
            <tr>
              <th className="py-2 px-3">HAZARD / ID</th>
              <th className="py-2 px-3">PRIORITY</th>
              <th className="py-2 px-3">CONFIDENCE</th>
              <th className="py-2 px-3">COORDINATES & ALT</th>
              <th className="py-2 px-3">TIME</th>
              <th className="py-2 px-3">CHANNEL</th>
              <th className="py-2 px-3">STATUS</th>
              <th className="py-2 px-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-[11px]">
            {events.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-slate-500 italic">
                  No detection events matching current criteria.
                </td>
              </tr>
            ) : (
              events.map((evt) => {
                const hazardCfg = getHazardConfig(evt.hazard);
                const prioCfg = PRIORITY_CONFIG[evt.priority] || PRIORITY_CONFIG.LOW;
                const HazardIcon = hazardCfg.icon;
                const isHigh = evt.priority === 'HIGH';
                const formattedTime = new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                return (
                  <tr 
                    key={evt.event_id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isHigh ? 'bg-rose-950/15 border-l-2 border-l-rose-500' : ''
                    }`}
                  >
                    
                    {/* Hazard & Event ID */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <HazardIcon className="w-3.5 h-3.5" style={{ color: hazardCfg.color }} />
                        <span className="font-bold text-white uppercase" style={{ color: hazardCfg.color }}>
                          {hazardCfg.label.split(' ')[0]}
                        </span>
                        <span className="text-slate-500 text-[10px]">({evt.event_id})</span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-2 px-3">
                      <span 
                        className="px-1.5 py-0.5 rounded text-[9px] font-bold inline-flex items-center gap-1"
                        style={{ backgroundColor: prioCfg.bg, color: prioCfg.color }}
                      >
                        {isHigh && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>}
                        {evt.priority}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="py-2 px-3 font-bold text-emerald-400">
                      {(evt.confidence * 100).toFixed(0)}%
                    </td>

                    {/* Coordinates */}
                    <td className="py-2 px-3 text-slate-300 font-mono text-[10px]">
                      {evt.latitude.toFixed(4)}°, {evt.longitude.toFixed(4)}° ({evt.altitude}m)
                    </td>

                    {/* Timestamp */}
                    <td className="py-2 px-3 text-slate-400 text-[10px] whitespace-nowrap">
                      {formattedTime}
                    </td>

                    {/* Channel */}
                    <td className="py-2 px-3">
                      <span className={`text-[10px] font-bold ${evt.channel === 'LORA' ? 'text-amber-400' : 'text-cyan-400'}`}>
                        {evt.channel}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                        evt.status === 'RESOLVED' 
                          ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-400' 
                          : evt.status === 'ACKNOWLEDGED'
                          ? 'bg-amber-950 border border-amber-500/40 text-amber-300'
                          : 'bg-rose-950 border border-rose-500/40 text-rose-300'
                      }`}>
                        {evt.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => onSelectEvent(evt)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition-all text-[10px] cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>EVIDENCE</span>
                      </button>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
