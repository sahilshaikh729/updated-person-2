import React from 'react';
import { UserCheck, MapPin, Eye, Filter, Sparkles, CheckCircle2 } from 'lucide-react';
import { getHazardConfig } from '../utils/hazardUtils';

export default function RecentPersonDetections({ 
  events, 
  selectedEvent, 
  onSelectEvent, 
  onInspectEvidence,
  onAcknowledgeStatus 
}) {
  // Separate person detections for primary focus
  const personDetections = events.filter(e => (e.hazard || '').toLowerCase() === 'person');
  const displayEvents = personDetections.length > 0 ? personDetections : events;

  return (
    <div className="tactical-panel p-3 bg-[#0a0e19] border border-slate-800/80 font-sans text-slate-200">
      
      {/* Table Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            RECENT PERSON DETECTIONS ({displayEvents.length})
          </h2>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> RESCUE TARGETS
          </span>
        </div>
      </div>

      {/* Detections List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-1.5 px-2">Detection Type</th>
              <th className="py-1.5 px-2">Confidence</th>
              <th className="py-1.5 px-2">Detection Time</th>
              <th className="py-1.5 px-2">GPS Coordinates</th>
              <th className="py-1.5 px-2">Channel</th>
              <th className="py-1.5 px-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {displayEvents.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-6 text-center text-slate-500 font-medium">
                  NO PERSON DETECTIONS RECORDED YET
                </td>
              </tr>
            ) : (
              displayEvents.slice(0, 10).map((evt) => {
                const isSelected = selectedEvent && selectedEvent.event_id === evt.event_id;
                const isPerson = (evt.hazard || '').toLowerCase() === 'person';
                const hazardCfg = getHazardConfig(evt.hazard);
                const confPct = Math.round((evt.confidence || 0) * 100);
                const timeStr = evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : 'N/A';

                return (
                  <tr
                    key={evt.event_id}
                    onClick={() => onSelectEvent(evt)}
                    className={`transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-950/60 text-white font-semibold' 
                        : 'hover:bg-slate-900/80 text-slate-300'
                    }`}
                  >
                    <td className="py-2 px-2 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isPerson ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                      <span className="font-bold text-slate-100">
                        {isPerson ? 'PERSON DETECTED' : hazardCfg.label}
                      </span>
                    </td>

                    <td className="py-2 px-2 font-semibold text-emerald-400">
                      {confPct}%
                    </td>

                    <td className="py-2 px-2 text-slate-400 font-mono text-[11px]">
                      {timeStr}
                    </td>

                    <td className="py-2 px-2 font-mono text-[11px] text-slate-300">
                      {evt.latitude?.toFixed(5)}°, {evt.longitude?.toFixed(5)}°
                    </td>

                    <td className="py-2 px-2 text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-cyan-400 font-semibold">
                        {evt.channel || 'WIFI'}
                      </span>
                    </td>

                    <td className="py-2 px-2 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(evt);
                        }}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-white font-semibold text-[11px] transition-all border border-slate-800 cursor-pointer"
                      >
                        INSPECT
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
