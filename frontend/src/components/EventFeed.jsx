import React, { useState } from 'react';
import { Search, Eye, Clock, User, Flame, Waves, Wind, Mountain, Package, ShieldCheck, Filter } from 'lucide-react';
import { getHazardConfig, PRIORITY_CONFIG } from '../utils/hazardUtils';

function getHazardIcon(hazard) {
  const h = (hazard || '').toLowerCase();
  switch (h) {
    case 'person': return User;
    case 'fire': return Flame;
    case 'flood': return Waves;
    case 'smoke': return Wind;
    case 'landslide': return Mountain;
    case 'debris': return Package;
    default: return Filter;
  }
}

export default function EventFeed({ 
  events = [], 
  filters = {}, 
  setFilters, 
  onSelectEvent, 
  onInspectEvidence,
  onFocusOnMap 
}) {
  const [activeCategory, setActiveCategory] = useState(filters.hazard || 'person');

  const categories = [
    { id: 'person', label: 'PERSON', icon: User, color: 'text-emerald-400', activeBg: 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300' },
    { id: 'fire', label: 'FIRE', icon: Flame, color: 'text-amber-500', activeBg: 'bg-amber-950/80 border-amber-500/60 text-amber-300' },
    { id: 'flood', label: 'FLOOD', icon: Waves, color: 'text-blue-400', activeBg: 'bg-blue-950/80 border-blue-500/60 text-blue-300' },
    { id: 'smoke', label: 'SMOKE', icon: Wind, color: 'text-slate-400', activeBg: 'bg-slate-900 border-slate-700 text-slate-200' },
    { id: 'landslide', label: 'LANDSLIDE', icon: Mountain, color: 'text-orange-400', activeBg: 'bg-orange-950/80 border-orange-500/60 text-orange-300' },
    { id: 'debris', label: 'DEBRIS', icon: Package, color: 'text-yellow-600', activeBg: 'bg-yellow-950/80 border-yellow-500/60 text-yellow-300' },
    { id: '', label: 'ALL HAZARDS', icon: Filter, color: 'text-slate-400', activeBg: 'bg-slate-800 text-white border-slate-600' }
  ];

  // Filter events by selected category (including BOTH active and resolved)
  const categoryEvents = events.filter((evt) => {
    const hazardMatch = !activeCategory || (evt.hazard || '').toLowerCase() === activeCategory.toLowerCase();
    const searchMatch = !filters.search || 
      evt.event_id.toLowerCase().includes(filters.search.toLowerCase()) ||
      (evt.hazard || '').toLowerCase().includes(filters.search.toLowerCase());
    return hazardMatch && searchMatch;
  });

  const getCategoryCount = (catId) => {
    if (!catId) return events.length;
    return events.filter(e => (e.hazard || '').toLowerCase() === catId.toLowerCase()).length;
  };

  return (
    <div className="tactical-panel flex flex-col h-full font-sans bg-[#0c1017] border border-slate-800/90 rounded-sm p-3 select-none">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-100">
              DETECTION CATEGORY HISTORY & AUDIT REVIEW
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-slate-900 border border-slate-800 text-slate-300">
              {categoryEvents.length} TOTAL RECORDS
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            Complete incident log per category. Resolved detections remain preserved for audit compliance.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
          <input
            type="text"
            placeholder="Search Event ID or notes..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-sm pl-8 pr-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-slate-600 font-sans"
          />
        </div>
      </div>

      {/* Category Selection Tabs Bar */}
      <div className="flex items-center gap-1 py-2 overflow-x-auto border-b border-slate-800/80">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          const count = getCategoryCount(cat.id);

          return (
            <button
              key={cat.id || 'all'}
              onClick={() => {
                setActiveCategory(cat.id);
                setFilters({ ...filters, hazard: cat.id });
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer whitespace-nowrap border ${
                isActive
                  ? 'bg-slate-800 text-slate-100 border-slate-600 font-semibold'
                  : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-slate-400" />
              <span>{cat.label}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-950 border border-slate-800 font-mono text-slate-400">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Incident History Review Table */}
      <div className="flex-1 overflow-y-auto mt-2 min-h-[350px]">
        <table className="w-full text-left font-sans border-collapse text-xs">
          <thead className="sticky top-0 bg-[#111622] border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wide z-10 font-semibold">
            <tr>
              <th className="py-2 px-3">EVENT ID</th>
              <th className="py-2 px-3">HAZARD TYPE</th>
              <th className="py-2 px-3">CONFIDENCE</th>
              <th className="py-2 px-3">PRIORITY</th>
              <th className="py-2 px-3">TIMESTAMP</th>
              <th className="py-2 px-3">LATITUDE</th>
              <th className="py-2 px-3">LONGITUDE</th>
              <th className="py-2 px-3">STATUS</th>
              <th className="py-2 px-3">EVIDENCE</th>
              <th className="py-2 px-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {categoryEvents.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-10 text-center text-slate-500 italic">
                  No detection records found for category "{activeCategory || 'ALL'}".
                </td>
              </tr>
            ) : (
              categoryEvents.map((evt) => {
                const Icon = getHazardIcon(evt.hazard);
                const confPct = Math.round((evt.confidence || 0) * 100);
                const isResolved = evt.status === 'RESOLVED';
                const formattedTime = new Date(evt.timestamp).toLocaleString();

                return (
                  <tr 
                    key={evt.event_id}
                    onClick={() => onSelectEvent && onSelectEvent(evt)}
                    className={`hover:bg-slate-900/60 transition-colors cursor-pointer ${
                      isResolved ? 'opacity-65 bg-slate-950/40 text-slate-400' : 'text-slate-300'
                    }`}
                  >
                    
                    {/* Event ID */}
                    <td className="py-2 px-3 font-mono font-semibold text-slate-200">
                      {evt.event_id}
                    </td>

                    {/* Hazard Type */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5 font-medium uppercase text-slate-300">
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.hazard}</span>
                      </div>
                    </td>

                    {/* Confidence */}
                    <td className="py-2 px-3 font-mono font-semibold text-slate-200">
                      {confPct}% Match
                    </td>

                    {/* Priority */}
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase font-mono ${
                        evt.priority === 'HIGH' 
                          ? 'bg-red-950 text-red-300 border border-red-800/60' 
                          : evt.priority === 'MEDIUM'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {evt.priority}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-2 px-3 text-slate-300 font-mono text-[11px]">
                      {formattedTime}
                    </td>

                    {/* Latitude */}
                    <td className="py-2 px-3 text-slate-300 font-mono">
                      {evt.latitude?.toFixed(5)}°
                    </td>

                    {/* Longitude */}
                    <td className="py-2 px-3 text-slate-300 font-mono">
                      {evt.longitude?.toFixed(5)}°
                    </td>

                    {/* Status */}
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase ${
                        isResolved
                          ? 'bg-slate-900 text-slate-500 border border-slate-800'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      }`}>
                        {evt.status || 'UNRESOLVED'}
                      </span>
                    </td>

                    {/* Evidence Attachment State */}
                    <td className="py-2 px-3">
                      {evt.image_path ? (
                        <span className="text-[10px] text-slate-300 font-medium bg-slate-900 border border-slate-700 px-1.5 py-0.2 rounded-sm font-mono">
                          IMAGE ATTACHED
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-normal bg-slate-950 border border-slate-800 px-1.5 py-0.2 rounded-sm font-mono">
                          TELEMETRY ONLY
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectEvent) onSelectEvent(evt);
                          }}
                          className="px-2 py-0.5 rounded-sm bg-blue-700 hover:bg-blue-600 text-white font-medium text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-blue-200" /> MAP FOCUS
                        </button>
                      </div>
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

