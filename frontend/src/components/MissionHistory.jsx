import React, { useState } from 'react';
import { History, Download, Calendar, Filter, FileSpreadsheet, FileJson, CheckCircle } from 'lucide-react';
import { getHazardConfig, PRIORITY_CONFIG } from '../utils/hazardUtils';

export default function MissionHistory({ events, onSelectEvent }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hazardFilter, setHazardFilter] = useState('');

  const filteredEvents = events.filter((evt) => {
    if (hazardFilter && evt.hazard !== hazardFilter) return false;
    if (startDate && new Date(evt.timestamp) < new Date(startDate)) return false;
    if (endDate && new Date(evt.timestamp) > new Date(endDate)) return false;
    return true;
  });

  const exportCSV = () => {
    if (filteredEvents.length === 0) return;
    const headers = ['event_id', 'hazard', 'confidence', 'priority', 'latitude', 'longitude', 'altitude', 'timestamp', 'channel', 'status'];
    const rows = filteredEvents.map(e => [
      e.event_id, e.hazard, e.confidence, e.priority, e.latitude, e.longitude, e.altitude, e.timestamp, e.channel, e.status
    ].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mission-audit-log-${Date.now()}.csv`;
    a.click();
  };

  const exportJSON = () => {
    if (filteredEvents.length === 0) return;
    const jsonContent = JSON.stringify(filteredEvents, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mission-audit-log-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-800 pb-4 font-mono">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">MISSION HISTORY & AUDIT LOGS</h2>
            <p className="text-xs text-slate-400">
              Review, filter, and export historical drone incident telemetry datasets.
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-semibold text-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> EXPORT CSV
          </button>
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-semibold text-xs transition-all cursor-pointer"
          >
            <FileJson className="w-4 h-4" /> EXPORT JSON
          </button>
        </div>
      </div>

      {/* Date & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">HAZARD CLASS</label>
          <select
            value={hazardFilter}
            onChange={(e) => setHazardFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
          >
            <option value="">ALL HAZARDS</option>
            <option value="fire">FIRE</option>
            <option value="smoke">SMOKE</option>
            <option value="flood">FLOOD</option>
            <option value="debris">DEBRIS</option>
            <option value="landslide">LANDSLIDE</option>
            <option value="person">PERSON IN DISTRESS</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">FROM TIMESTAMP</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">TO TIMESTAMP</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40 font-mono text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px] uppercase">
            <tr>
              <th className="p-3">EVENT ID</th>
              <th className="p-3">HAZARD</th>
              <th className="p-3">PRIORITY</th>
              <th className="p-3">CONFIDENCE</th>
              <th className="p-3">LATITUDE / LONGITUDE</th>
              <th className="p-3">TIMESTAMP</th>
              <th className="p-3">STATUS</th>
              <th className="p-3 text-right">INSPECT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredEvents.map((evt) => {
              const hazardCfg = getHazardConfig(evt.hazard);
              const prioCfg = PRIORITY_CONFIG[evt.priority] || PRIORITY_CONFIG.LOW;

              return (
                <tr key={evt.event_id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3 font-bold text-white">{evt.event_id}</td>
                  <td className="p-3 uppercase font-bold" style={{ color: hazardCfg.color }}>
                    {hazardCfg.label}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: prioCfg.bg, color: prioCfg.color }}>
                      {evt.priority}
                    </span>
                  </td>
                  <td className="p-3 text-emerald-400 font-bold">{(evt.confidence * 100).toFixed(0)}%</td>
                  <td className="p-3 text-slate-300">{evt.latitude.toFixed(5)}°, {evt.longitude.toFixed(5)}°</td>
                  <td className="p-3 text-slate-400">{new Date(evt.timestamp).toLocaleString()}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-300">
                      {evt.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onSelectEvent(evt)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white transition-all"
                    >
                      VIEW
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
