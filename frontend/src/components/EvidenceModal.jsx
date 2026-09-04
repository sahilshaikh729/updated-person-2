import React, { useState } from 'react';
import { X, Download, ShieldCheck, AlertCircle, Clock, MapPin, Radio, Wifi, CheckCircle2, FileText } from 'lucide-react';
import { getHazardConfig, PRIORITY_CONFIG } from '../utils/hazardUtils';

export default function EvidenceModal({ event, onClose, onUpdateStatus }) {
  if (!event) return null;

  const [notes, setNotes] = useState(event.notes || '');
  const [currentStatus, setCurrentStatus] = useState(event.status || 'UNRESOLVED');
  const [isUpdating, setIsUpdating] = useState(false);

  const hazardCfg = getHazardConfig(event.hazard);
  const prioCfg = PRIORITY_CONFIG[event.priority] || PRIORITY_CONFIG.LOW;
  const HazardIcon = hazardCfg.icon;

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(event.event_id, newStatus, notes);
      setCurrentStatus(newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 select-none">
      
      <div className="w-full max-w-5xl overflow-hidden shadow-xl border border-slate-800 bg-[#0c1017] rounded-sm max-h-[92vh] flex flex-col font-sans">
        
        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-[#111622]">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200">
              <HazardIcon className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
                  {hazardCfg.label} RECORD DETAILS
                </h2>
                <span className="px-2 py-0.5 rounded-sm bg-slate-900 border border-slate-700 text-xs text-slate-300 font-mono">
                  {event.event_id}
                </span>
                <span className="px-2 py-0.5 rounded-sm text-xs font-mono bg-slate-900 text-slate-300 border border-slate-800">
                  {event.channel === 'LORA' ? 'LORA TELEMETRY' : 'WI-FI FULL'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                SIH Drone Tactical Evidence Viewer & Incident Log
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          
          {/* Left Column: Optical Image Evidence Frame or Evidence Unavailable State */}
          <div className="lg:col-span-2 p-5 flex flex-col justify-center items-center bg-[#090d16] relative">
            {event.image_path ? (
              <div className="w-full h-full min-h-[360px] max-h-[480px] flex items-center justify-center rounded-sm overflow-hidden border border-slate-800 bg-black relative">
                <img
                  src={event.image_path}
                  alt={`Evidence artifact for ${event.event_id}`}
                  className="w-full h-full object-contain"
                />

                <a
                  href={event.image_path}
                  target="_blank"
                  rel="noreferrer"
                  download={`EVIDENCE-${event.event_id}.jpg`}
                  className="absolute top-3 right-3 px-2.5 py-1 rounded-sm bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" /> EXPORT FILE
                </a>
              </div>
            ) : (
              <div className="w-full h-full min-h-[360px] flex flex-col items-center justify-center p-6 rounded-sm border border-slate-800 bg-slate-950 text-center space-y-2.5">
                <div className="w-12 h-12 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <AlertCircle className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  EVIDENCE UNAVAILABLE
                </h3>
                <p className="text-xs text-slate-400 max-w-sm font-sans">
                  No optical image file attached to telemetry payload for event <span className="text-slate-200 font-mono font-semibold">{event.event_id}</span>.
                </p>
                <div className="p-3 rounded-sm bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono space-y-1 text-left max-w-sm w-full">
                  <div><strong>Hazard:</strong> {event.hazard?.toUpperCase()}</div>
                  <div><strong>Coordinates:</strong> {event.latitude?.toFixed(5)}°, {event.longitude?.toFixed(5)}°</div>
                  <div><strong>Channel:</strong> {event.channel || 'WIFI'}</div>
                  <div><strong>Ingest Time:</strong> {new Date(event.timestamp).toLocaleString()}</div>
                </div>
              </div>
            )}

            <div className="w-full mt-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
              <span>PATH: {event.image_path || 'NULL (TELEMETRY ONLY)'}</span>
              <span>TIMESTAMP: {new Date(event.timestamp).toLocaleString()}</span>
            </div>
          </div>

          {/* Right Column: Telemetry & Actions Sidebar */}
          <div className="p-5 bg-[#0c1017] flex flex-col justify-between space-y-4 font-sans text-xs">
            
            <div className="space-y-3.5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-300 border-b border-slate-800 pb-1.5">
                INCIDENT METADATA
              </h3>

              {/* Priority & Confidence Box */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-sm border border-slate-800 bg-slate-900/60">
                  <div className="text-slate-400 text-[10px] uppercase font-medium">PRIORITY LEVEL</div>
                  <div className="text-xs font-semibold font-mono mt-0.5 text-slate-100">
                    {event.priority}
                  </div>
                </div>

                <div className="p-2.5 rounded-sm border border-slate-800 bg-slate-900/60">
                  <div className="text-slate-400 text-[10px] uppercase font-medium">CONFIDENCE</div>
                  <div className="text-xs font-semibold font-mono text-slate-100 mt-0.5">
                    {(event.confidence * 100).toFixed(1)}% Match
                  </div>
                </div>
              </div>

              {/* Coordinates Box */}
              <div className="p-3 rounded-sm border border-slate-800 bg-slate-900/60 space-y-1.5">
                <div className="text-slate-400 text-[10px] uppercase font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> GPS POSITION
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-200 text-xs font-mono font-semibold">
                  <div>LAT: {event.latitude.toFixed(6)}°</div>
                  <div>LNG: {event.longitude.toFixed(6)}°</div>
                </div>
                <div className="text-slate-400 text-[11px]">
                  ALTITUDE: <span className="text-slate-200 font-mono font-semibold">{event.altitude || 45}m</span>
                </div>
              </div>

              {/* Description */}
              <div className="p-2.5 rounded-sm border border-slate-800 bg-slate-900/40 text-slate-300 text-[11px] leading-relaxed">
                {hazardCfg.description}
              </div>

              {/* Action Notes Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-slate-400 uppercase flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> COMMANDER NOTES
                </label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter field notes or assignment updates..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-sm p-2 text-slate-200 text-xs placeholder-slate-600 focus:outline-none focus:border-slate-600 font-sans"
                ></textarea>
              </div>

            </div>

            {/* Status Selector Footer */}
            <div className="space-y-1.5 pt-3 border-t border-slate-800">
              <div className="text-[10px] font-medium text-slate-400 uppercase">
                UPDATE INCIDENT STATUS
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleStatusChange('UNRESOLVED')}
                  disabled={isUpdating}
                  className={`py-1.5 rounded-sm font-semibold text-[10px] transition-colors cursor-pointer border ${
                    currentStatus === 'UNRESOLVED'
                      ? 'bg-red-950 text-red-200 border-red-800'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  UNRESOLVED
                </button>
                <button
                  onClick={() => handleStatusChange('ACKNOWLEDGED')}
                  disabled={isUpdating}
                  className={`py-1.5 rounded-sm font-semibold text-[10px] transition-colors cursor-pointer border ${
                    currentStatus === 'ACKNOWLEDGED'
                      ? 'bg-amber-950 text-amber-200 border-amber-800'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  ACKNOWLEDGED
                </button>
                <button
                  onClick={() => handleStatusChange('RESOLVED')}
                  disabled={isUpdating}
                  className={`py-1.5 rounded-sm font-semibold text-[10px] transition-colors cursor-pointer border ${
                    currentStatus === 'RESOLVED'
                      ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  RESOLVED
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
