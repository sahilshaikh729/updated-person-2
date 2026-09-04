import React, { useState } from 'react';
import { Table, Search, Eye, MapPin, CheckCircle2, AlertTriangle, User, Flame, Waves, Wind, Mountain, Package } from 'lucide-react';
import { getHazardConfig } from '../utils/hazardUtils';

function getHazardIcon(hazard) {
  const h = (hazard || '').toLowerCase();
  switch (h) {
    case 'person': return User;
    case 'fire': return Flame;
    case 'flood': return Waves;
    case 'smoke': return Wind;
    case 'landslide': return Mountain;
    case 'debris': return Package;
    default: return AlertTriangle;
  }
}

export default function AllIncidentDataTable({ 
  events = [], 
  selectedEvent, 
  onSelectEvent, 
  onInspectEvidence,
  onResolveEvent 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'UNRESOLVED', 'RESOLVED'

  // Filter events based on search term and status
  const filteredEvents = events.filter((evt) => {
    const matchesSearch = 
      !searchTerm ||
      evt.event_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.hazard || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.priority || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'UNRESOLVED' && evt.status !== 'RESOLVED') ||
      (statusFilter === 'RESOLVED' && evt.status === 'RESOLVED');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="tactical-panel bg-[#0a0e19] border border-slate-800/80 rounded font-sans text-slate-200">
      
      {/* Header & Controls Bar */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            ALL INCIDENT DATA ({events.length} TOTAL RECORDS)
          </h2>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          
          {/* Status Filter Tabs */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded border border-slate-800 text-[11px]">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                statusFilter === 'ALL' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ALL ({events.length})
            </button>
            <button
              onClick={() => setStatusFilter('UNRESOLVED')}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                statusFilter === 'UNRESOLVED' ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800/60' : 'text-slate-400 hover:text-white'
              }`}
            >
              ACTIVE ({events.filter(e => e.status !== 'RESOLVED').length})
            </button>
            <button
              onClick={() => setStatusFilter('RESOLVED')}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                statusFilter === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/60' : 'text-slate-400 hover:text-white'
              }`}
            >
              RESOLVED ({events.filter(e => e.status === 'RESOLVED').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search ID, type, priority..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded pl-8 pr-3 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-48"
            />
          </div>

        </div>
      </div>

      {/* Real Backend Data Table */}
      <div className="overflow-x-auto max-h-[340px]">
        <table className="w-full text-left border-collapse text-xs font-sans">
          <thead className="bg-slate-900/90 text-slate-400 text-[10px] uppercase font-bold sticky top-0 z-10 border-b border-slate-800">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">TYPE</th>
              <th className="px-3 py-2">PRIORITY</th>
              <th className="px-3 py-2">CONFIDENCE</th>
              <th className="px-3 py-2">TIME</th>
              <th className="px-3 py-2">LATITUDE</th>
              <th className="px-3 py-2">LONGITUDE</th>
              <th className="px-3 py-2">STATUS</th>
              <th className="px-3 py-2 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-6 text-slate-500 text-xs italic">
                  No incident data matches your filters.
                </td>
              </tr>
            ) : (
              filteredEvents.map((evt) => {
                const isSelected = selectedEvent && selectedEvent.event_id === evt.event_id;
                const isResolved = evt.status === 'RESOLVED';
                const Icon = getHazardIcon(evt.hazard);
                const hazardCfg = getHazardConfig(evt.hazard);
                const confPct = Math.round((evt.confidence || 0) * 100);
                const timeStr = evt.timestamp 
                  ? new Date(evt.timestamp).toLocaleTimeString() 
                  : 'N/A';

                return (
                  <tr
                    key={evt.event_id}
                    onClick={() => onSelectEvent(evt)}
                    className={`transition-colors cursor-pointer text-[11px] ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500/50 text-white font-semibold'
                        : isResolved
                          ? 'bg-slate-950/40 text-slate-400 hover:bg-slate-900/60'
                          : 'hover:bg-slate-900/70 text-slate-200'
                    }`}
                  >
                    {/* ID */}
                    <td className="px-3 py-2 font-mono font-bold text-slate-200">
                      {evt.event_id}
                    </td>

                    {/* TYPE */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5 font-bold" style={{ color: hazardCfg.color }}>
                        <Icon className="w-3.5 h-3.5" />
                        <span className="uppercase">{evt.hazard}</span>
                      </div>
                    </td>

                    {/* PRIORITY */}
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                        evt.priority === 'HIGH' 
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/60' 
                          : evt.priority === 'MEDIUM'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                      }`}>
                        {evt.priority}
                      </span>
                    </td>

                    {/* CONFIDENCE */}
                    <td className="px-3 py-2 font-mono font-bold text-emerald-400">
                      {confPct}%
                    </td>

                    {/* TIME */}
                    <td className="px-3 py-2 text-slate-300 font-mono">
                      {timeStr}
                    </td>

                    {/* LATITUDE */}
                    <td className="px-3 py-2 font-mono text-slate-300">
                      {evt.latitude?.toFixed(5)}°
                    </td>

                    {/* LONGITUDE */}
                    <td className="px-3 py-2 font-mono text-slate-300">
                      {evt.longitude?.toFixed(5)}°
                    </td>

                    {/* STATUS */}
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                        isResolved
                          ? 'bg-slate-900 text-slate-500 border border-slate-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800/60 animate-pulse'
                      }`}>
                        {evt.status || 'UNRESOLVED'}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onInspectEvidence(evt);
                          }}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold border border-slate-700 cursor-pointer"
                        >
                          EVIDENCE
                        </button>
                        
                        {!isResolved && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onResolveEvent(evt.event_id);
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-bold border border-emerald-600 cursor-pointer"
                          >
                            RESOLVE
                          </button>
                        )}
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
