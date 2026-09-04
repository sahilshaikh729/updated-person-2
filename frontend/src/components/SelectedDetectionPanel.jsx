import React from 'react';
import { UserCheck, Eye, MapPin, Clock, ShieldAlert, Cpu, Radio, ExternalLink } from 'lucide-react';
import { getHazardConfig } from '../utils/hazardUtils';

export default function SelectedDetectionPanel({ selectedEvent, onInspectEvidence, onResolve, onClose }) {
  if (!selectedEvent) {
    return (
      <div className="tactical-panel h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 font-sans border border-slate-800/80 bg-[#0a0e19]">
        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 text-slate-500">
          <UserCheck className="w-6 h-6 opacity-60" />
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
          NO EVENT SELECTED
        </h3>
        <p className="text-[12px] text-slate-400 max-w-xs">
          Click any priority item or map marker to view event details and resolve incidents.
        </p>
      </div>
    );
  }

  const isPerson = (selectedEvent.hazard || '').toLowerCase() === 'person';
  const hazardCfg = getHazardConfig(selectedEvent.hazard);
  const confPct = Math.round((selectedEvent.confidence || 0) * 100);
  const timeStr = selectedEvent.timestamp 
    ? new Date(selectedEvent.timestamp).toLocaleTimeString() 
    : 'N/A';
  const isResolved = selectedEvent.status === 'RESOLVED';

  return (
    <div className="tactical-panel h-full flex flex-col justify-between p-3.5 bg-[#0a0e19] border border-slate-800/80 font-sans text-slate-200">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isResolved ? 'bg-slate-500' : isPerson ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              {isPerson ? 'PERSON DETECTED' : `${hazardCfg.label.toUpperCase()} DETECTED`}
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
              selectedEvent.priority === 'HIGH' 
                ? 'bg-rose-950 text-rose-300 border border-rose-800/60' 
                : selectedEvent.priority === 'MEDIUM'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
            }`}>
              {selectedEvent.priority || 'HIGH'}
            </span>

            {onClose && (
              <button
                onClick={onClose}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                title="Back to Priority List"
              >
                ← BACK
              </button>
            )}
          </div>
        </div>

        {/* Actual Detection Evidence Image or Evidence Unavailable State */}
        <div className="relative rounded overflow-hidden bg-slate-950 border border-slate-800/80 min-h-[170px] flex items-center justify-center group">
          {selectedEvent.image_path ? (
            <img
              src={selectedEvent.image_path}
              alt={`Evidence for ${selectedEvent.event_id}`}
              className="w-full h-[170px] object-cover"
            />
          ) : (
            <div className="text-center p-6 space-y-1.5 select-none">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <UserCheck className="w-5 h-5 opacity-50 text-slate-400" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">EVIDENCE UNAVAILABLE</p>
              <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto">No optical image file uploaded for event {selectedEvent.event_id}</p>
            </div>
          )}

          {/* Image Overlay Bounding Box Badge */}
          {selectedEvent.image_path && (
            <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded">
              {isPerson ? 'PERSON' : hazardCfg.label.toUpperCase()} ({confPct}%)
            </div>
          )}

          <button
            onClick={() => onInspectEvidence(selectedEvent)}
            className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-[11px] font-semibold border border-slate-700 transition-all flex items-center gap-1 opacity-90 hover:opacity-100 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> DETAILS
          </button>
        </div>
      </div>

      {/* Detection Metadata Grid */}
      <div className="space-y-2 py-2 border-t border-b border-slate-800/80 my-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-900/60 p-2 rounded border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block font-medium">CONFIDENCE</span>
            <span className="text-sm font-bold text-emerald-400">{confPct}% Match</span>
          </div>

          <div className="bg-slate-900/60 p-2 rounded border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block font-medium">STATUS</span>
            <span className={`text-xs font-bold ${isResolved ? 'text-slate-400' : 'text-amber-400'}`}>
              {selectedEvent.status || 'UNRESOLVED'}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-2 rounded border border-slate-800/60 font-mono text-[11px] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" /> LATITUDE:
            </span>
            <span className="font-bold text-slate-200">{selectedEvent.latitude?.toFixed(6) || 'N/A'}°</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" /> LONGITUDE:
            </span>
            <span className="font-bold text-slate-200">{selectedEvent.longitude?.toFixed(6) || 'N/A'}°</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span className="text-slate-400">TIMESTAMP:</span>
            <span className="text-slate-300 font-semibold">{timeStr}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">EVENT ID:</span>
            <span className="text-slate-300 font-semibold">{selectedEvent.event_id}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons: EXPAND EVIDENCE & [ RESOLVE ] */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => onInspectEvidence(selectedEvent)}
          className="py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-1 border border-slate-700 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>EVIDENCE</span>
        </button>

        {!isResolved ? (
          <button
            onClick={() => onResolve && onResolve(selectedEvent.event_id)}
            className="py-1.5 px-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1 shadow cursor-pointer active:scale-95"
          >
            <span>[ RESOLVE ]</span>
          </button>
        ) : (
          <div className="py-1.5 px-2 rounded bg-slate-900 border border-slate-800 text-slate-500 font-bold text-xs flex items-center justify-center">
            RESOLVED
          </div>
        )}
      </div>

    </div>
  );
}
