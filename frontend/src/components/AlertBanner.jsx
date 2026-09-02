import React, { useEffect } from 'react';
import { AlertOctagon, Eye, CheckCircle, X } from 'lucide-react';
import { getHazardConfig, playAlertChime } from '../utils/hazardUtils';

export default function AlertBanner({ latestHighEvent, soundEnabled, onSelectEvent, onAcknowledge }) {
  if (!latestHighEvent) return null;

  const hazardCfg = getHazardConfig(latestHighEvent.hazard);
  const HazardIcon = hazardCfg.icon;

  useEffect(() => {
    if (soundEnabled && latestHighEvent) {
      playAlertChime();
    }
  }, [latestHighEvent?.event_id, soundEnabled]);

  return (
    <div className="mb-6 p-4 rounded-xl border border-rose-500/70 bg-gradient-to-r from-rose-950/90 via-slate-950/90 to-rose-950/90 shadow-2xl alert-flash flex flex-col md:flex-row items-center justify-between gap-4">
      
      <div className="flex items-center gap-3.5">
        <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 animate-pulse">
          <AlertOctagon className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-rose-500 text-black font-extrabold text-[11px] font-mono tracking-wider uppercase">
              CRITICAL EMERGENCY ALERT
            </span>
            <span className="text-xs font-mono text-rose-300 font-semibold">
              ID: {latestHighEvent.event_id}
            </span>
            <span className="text-xs font-mono text-slate-400">
              via {latestHighEvent.channel}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-lg font-bold text-white flex items-center gap-1.5" style={{ color: hazardCfg.color }}>
              <HazardIcon className="w-5 h-5" />
              {hazardCfg.label}
            </span>
            <span className="text-xs font-mono text-slate-300">
              Confidence: <strong className="text-emerald-400">{(latestHighEvent.confidence * 100).toFixed(0)}%</strong>
            </span>
            <span className="text-xs font-mono text-slate-300 hidden sm:inline">
              Location: <strong>{latestHighEvent.latitude.toFixed(4)}°, {latestHighEvent.longitude.toFixed(4)}°</strong> (Alt: {latestHighEvent.altitude}m)
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end font-mono text-xs">
        <button
          onClick={() => onSelectEvent(latestHighEvent)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          INSPECT EVIDENCE
        </button>
        <button
          onClick={() => onAcknowledge(latestHighEvent.event_id)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold transition-all cursor-pointer"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          ACKNOWLEDGE
        </button>
      </div>

    </div>
  );
}
