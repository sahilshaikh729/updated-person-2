import React from 'react';
import { AlertOctagon, Eye, CheckCircle2, ShieldAlert, Radio, Clock } from 'lucide-react';
import { getHazardConfig, PRIORITY_CONFIG } from '../utils/hazardUtils';

export default function EmergencyAlertsPanel({ events, onSelectEvent, onAcknowledgeStatus }) {
  // Sort high priority alerts first, then newest
  const sortedAlerts = [...events].sort((a, b) => {
    if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1;
    if (a.priority !== 'HIGH' && b.priority === 'HIGH') return 1;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return (
    <div className="tactical-panel flex flex-col h-full font-sans">
      
      {/* Panel Header */}
      <div className="tactical-panel-header flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            EMERGENCY ALERTS
          </h2>
        </div>
        <span className="text-[10px] bg-rose-950 border border-rose-800 text-rose-400 font-bold px-2 py-0.5 rounded">
          LIVE FEED
        </span>
      </div>

      {/* Alerts Stream */}
      <div className="p-3 space-y-2 flex-1 overflow-y-auto font-mono">
        {sortedAlerts.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs italic">
            No active emergency alerts.
          </div>
        ) : (
          sortedAlerts.map((evt) => {
            const hazardCfg = getHazardConfig(evt.hazard);
            const prioCfg = PRIORITY_CONFIG[evt.priority] || PRIORITY_CONFIG.LOW;
            const HazardIcon = hazardCfg.icon;
            const isHigh = evt.priority === 'HIGH';
            const isResolved = evt.status === 'RESOLVED';
            const timeAgo = new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            return (
              <div
                key={evt.event_id}
                className={`p-3 rounded border transition-all ${
                  isHigh && !isResolved
                    ? 'border-rose-500/80 bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-rose-950/40 critical-alert-glow'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                }`}
              >
                {/* Alert Top Row */}
                <div className="flex items-center justify-between mb-1.5">
                  <span 
                    className="px-1.5 py-0.5 text-[9px] rounded font-extrabold tracking-wider uppercase inline-flex items-center gap-1"
                    style={{ backgroundColor: prioCfg.bg, color: prioCfg.color, border: `1px solid ${prioCfg.border}` }}
                  >
                    {isHigh && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>}
                    {evt.priority} ALERT
                  </span>

                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {timeAgo}
                  </span>
                </div>

                {/* Hazard Name & Confidence */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <HazardIcon className="w-4 h-4" style={{ color: hazardCfg.color }} />
                    <span className="text-sm font-extrabold uppercase text-white" style={{ color: hazardCfg.color }}>
                      {hazardCfg.label} DETECTED
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">
                    {(evt.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Telemetry Summary */}
                <div className="text-[11px] text-slate-300 space-y-0.5 my-2 bg-black/40 p-1.5 rounded border border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500">EVENT ID:</span>
                    <span className="font-bold text-slate-200">{evt.event_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">LOCATION:</span>
                    <span className="text-slate-200">{evt.latitude.toFixed(4)}°, {evt.longitude.toFixed(4)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ALTITUDE / CH:</span>
                    <span className="text-slate-200">{evt.altitude}m ({evt.channel})</span>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                  <span className={`font-semibold ${
                    isResolved ? 'text-emerald-400' : evt.status === 'ACKNOWLEDGED' ? 'text-amber-300' : 'text-rose-400'
                  }`}>
                    ● {evt.status}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {evt.status !== 'ACKNOWLEDGED' && !isResolved && (
                      <button
                        onClick={() => onAcknowledgeStatus(evt.event_id, 'ACKNOWLEDGED')}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold cursor-pointer"
                      >
                        ACK
                      </button>
                    )}

                    <button
                      onClick={() => onSelectEvent(evt)}
                      className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" /> INSPECT
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
