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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      
      <div className="glass-panel w-full max-w-5xl overflow-hidden shadow-2xl border-slate-700/60 max-h-[92vh] flex flex-col font-sans">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: hazardCfg.bg, color: hazardCfg.color }}>
              <HazardIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-mono">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider" style={{ color: hazardCfg.color }}>
                  {hazardCfg.label} DETECTED
                </h2>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300 font-semibold">
                  {event.event_id}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  event.channel === 'LORA' ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40' : 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/40'
                }`}>
                  {event.channel === 'LORA' ? 'LORA TELEMETRY' : 'WI-FI FULL'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                SIH Drone Tactical Evidence Viewer & Telemetry Log
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          
          {/* Left Column: Optical Image Evidence Frame */}
          <div className="lg:col-span-2 p-6 flex flex-col justify-center items-center bg-slate-950/80 relative">
            <div className="w-full h-full min-h-[380px] max-h-[500px] flex items-center justify-center rounded-xl overflow-hidden border border-slate-800 bg-black shadow-inner relative group">
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
                className="absolute top-4 right-4 p-2.5 rounded-lg bg-slate-900/90 hover:bg-cyan-600 text-slate-300 hover:text-white border border-slate-700 transition-all font-mono text-xs flex items-center gap-1.5 shadow-lg"
              >
                <Download className="w-4 h-4" /> EXPORT FULL RES
              </a>
            </div>

            <div className="w-full mt-3 flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span>PATH: {event.image_path}</span>
              <span>TIMESTAMP: {new Date(event.timestamp).toLocaleString()}</span>
            </div>
          </div>

          {/* Right Column: Telemetry & Actions Sidebar */}
          <div className="p-6 bg-slate-900/40 flex flex-col justify-between space-y-6 font-mono text-xs">
            
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                DRONE TELEMETRY DATA
              </h3>

              {/* Priority & Confidence Box */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/80">
                  <div className="text-slate-400 text-[10px] uppercase">PRIORITY LEVEL</div>
                  <div className="text-sm font-bold mt-1" style={{ color: prioCfg.color }}>
                    {event.priority}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/80">
                  <div className="text-slate-400 text-[10px] uppercase">CONFIDENCE</div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">
                    {(event.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Coordinates Box */}
              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/80 space-y-2">
                <div className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" /> GPS POSITION
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-200 text-xs font-bold">
                  <div>LAT: {event.latitude.toFixed(6)}°</div>
                  <div>LNG: {event.longitude.toFixed(6)}°</div>
                </div>
                <div className="text-slate-400 text-[11px]">
                  ALTITUDE: <span className="text-cyan-300 font-bold">{event.altitude}m</span> (A bridge altitude from drone barometer)
                </div>
              </div>

              {/* Description */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 text-[11px] leading-relaxed">
                {hazardCfg.description}
              </div>

              {/* Action Notes Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> INCIDENT COMMANDER NOTES
                </label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter dispatch notes, ground team assignment, or field updates..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-xs placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

            </div>

            {/* Status Selector Footer */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase">
                UPDATE INCIDENT STATUS
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleStatusChange('UNRESOLVED')}
                  disabled={isUpdating}
                  className={`py-2 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                    currentStatus === 'UNRESOLVED'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  UNRESOLVED
                </button>
                <button
                  onClick={() => handleStatusChange('ACKNOWLEDGED')}
                  disabled={isUpdating}
                  className={`py-2 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                    currentStatus === 'ACKNOWLEDGED'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  ACKNOWLEDGED
                </button>
                <button
                  onClick={() => handleStatusChange('RESOLVED')}
                  disabled={isUpdating}
                  className={`py-2 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                    currentStatus === 'RESOLVED'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
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
