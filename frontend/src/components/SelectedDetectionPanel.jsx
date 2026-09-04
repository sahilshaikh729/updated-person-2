import React from 'react';
import { UserCheck, Eye, MapPin, Clock, ShieldAlert, Cpu, Radio, ExternalLink } from 'lucide-react';
import { getHazardConfig } from '../utils/hazardUtils';

export default function SelectedDetectionPanel({ selectedEvent, onInspectEvidence, onResolve, onClose }) {
  if (!selectedEvent) {
    return (
      <div className="tactical-panel h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 font-sans border border-slate-800/90 bg-[#0c1017] select-none">
        <div className="w-10 h-10 rounded bg-slate-900 border border-slate-800 flex items-center justify-center mb-2.5 text-slate-500">
          <UserCheck className="w-5 h-5 opacity-60" />
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-1">
          NO EVENT SELECTED
        </h3>
        <p className="text-[11px] text-slate-400 max-w-xs">
          Click any priority item or map marker to inspect event record details.
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
    <div className="tactical-panel h-full flex flex-col justify-between p-3 bg-[#0c1017] border border-slate-800/90 font-sans text-slate-200 select-none">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isResolved ? 'bg-slate-500' : isPerson ? 'bg-red-500' : 'bg-amber-500'}`}></span>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-100">
              {isPerson ? 'PERSON DETECTED (RESCUE)' : `${hazardCfg.label.toUpperCase()} RECORD`}
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`px-1.5 py-0.2 text-[10px] font-semibold rounded uppercase font-mono ${
              selectedEvent.priority === 'HIGH' 
                ? 'bg-red-950 text-red-300 border border-red-800/60' 
                : selectedEvent.priority === 'MEDIUM'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {selectedEvent.priority || 'HIGH'}
            </span>

            {onClose && (
              <button
                onClick={onClose}
                className="text-[10px] font-medium px-2 py-0.5 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                title="Back to Priority List"
              >
                ← BACK
              </button>
            )}
          </div>
        </div>

        {/* Actual Detection Evidence Image or Evidence Unavailable State */}
        <div className="relative rounded-sm overflow-hidden bg-slate-950 border border-slate-800/90 min-h-[160px] flex items-center justify-center">
          {selectedEvent.image_path ? (
            <img
              src={selectedEvent.image_path}
              alt={`Evidence for ${selectedEvent.event_id}`}
              className="w-full h-[160px] object-cover"
            />
          ) : (
            <div className="text-center p-4 space-y-1 select-none">
              <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <UserCheck className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">EVIDENCE UNAVAILABLE</p>
              <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto">No optical evidence payload provided for event {selectedEvent.event_id}</p>
            </div>
          )}

          {/* Image Overlay Bounding Box Badge */}
          {selectedEvent.image_path && (
            <div className="absolute top-2 left-2 bg-slate-950/90 border border-slate-700 text-slate-200 text-[10px] font-mono px-1.5 py-0.5 rounded-sm">
              {isPerson ? 'PERSON' : hazardCfg.label.toUpperCase()} ({confPct}%)
            </div>
          )}

          <button
            onClick={() => onInspectEvidence(selectedEvent)}
            className="absolute bottom-2 right-2 px-2 py-0.5 rounded-sm bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-[10px] font-medium border border-slate-700 flex items-center gap-1 cursor-pointer"
          >
            <Eye className="w-3 h-3 text-slate-400" /> DETAILS
          </button>
        </div>
      </div>

      {/* Detection Metadata Grid */}
      <div className="space-y-1.5 py-2 border-t border-b border-slate-800/80 my-1 text-xs font-sans">
        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-slate-900/60 p-1.5 rounded-sm border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-medium">CONFIDENCE</span>
            <span className="text-xs font-semibold text-slate-100 font-mono">{confPct}% Match</span>
          </div>

          <div className="bg-slate-900/60 p-1.5 rounded-sm border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-medium">STATUS</span>
            <span className={`text-xs font-semibold font-mono ${isResolved ? 'text-slate-400' : 'text-amber-400'}`}>
              {selectedEvent.status || 'UNRESOLVED'}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-2 rounded-sm border border-slate-800/80 font-mono text-[11px] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1 font-sans">
              <MapPin className="w-3 h-3 text-slate-400" /> LAT:
            </span>
            <span className="font-semibold text-slate-200">{selectedEvent.latitude?.toFixed(6) || 'N/A'}°</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1 font-sans">
              <MapPin className="w-3 h-3 text-slate-400" /> LNG:
            </span>
            <span className="font-semibold text-slate-200">{selectedEvent.longitude?.toFixed(6) || 'N/A'}°</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span className="text-slate-400 font-sans">TIMESTAMP:</span>
            <span className="text-slate-300 font-semibold">{timeStr}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">EVENT ID:</span>
            <span className="text-slate-300 font-semibold">{selectedEvent.event_id}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <button
          onClick={() => onInspectEvidence(selectedEvent)}
          className="py-1.5 px-2 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-1 border border-slate-700 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <span>EVIDENCE</span>
        </button>

        {!isResolved ? (
          <button
            onClick={() => onResolve && onResolve(selectedEvent.event_id)}
            className="py-1.5 px-2 rounded-sm bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1 border border-emerald-600 cursor-pointer"
          >
            <span>RESOLVE</span>
          </button>
        ) : (
          <div className="py-1.5 px-2 rounded-sm bg-slate-900 border border-slate-800 text-slate-500 font-medium text-xs flex items-center justify-center">
            RESOLVED
          </div>
        )}
      </div>

    </div>
  );
}
