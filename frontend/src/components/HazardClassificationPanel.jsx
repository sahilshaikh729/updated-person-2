import React from 'react';
import { Layers, AlertTriangle, Eye, ShieldAlert, Cpu } from 'lucide-react';
import { HAZARD_CONFIG, PRIORITY_CONFIG, getHazardConfig } from '../utils/hazardUtils';

export default function HazardClassificationPanel({ 
  stats, 
  events, 
  activeFilter, 
  onSelectFilter, 
  onSelectEvent 
}) {
  const totalEvents = stats.total_events || 0;
  const activeHigh = stats.active_high_priority || 0;
  const hazardCounts = stats.hazard_breakdown || {};

  // Filter detections for the left stream if a hazard filter is set
  const displayedDetections = activeFilter.hazard
    ? events.filter(e => e.hazard === activeFilter.hazard).slice(0, 8)
    : events.slice(0, 8);

  return (
    <div className="tactical-panel flex flex-col h-full font-sans">
      
      {/* Panel Header */}
      <div className="tactical-panel-header flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            AI HAZARD CLASSIFICATION
          </h2>
        </div>
        <span className="text-[10px] bg-slate-900 border border-slate-800 text-cyan-400 font-bold px-2 py-0.5 rounded">
          6 CLASSES
        </span>
      </div>

      <div className="p-3 space-y-3 flex-1 flex flex-col overflow-y-auto">
        
        {/* Detection Summary Cards */}
        <div className="grid grid-cols-2 gap-2 font-mono">
          
          <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">OBJECTS DETECTED</div>
            <div className="text-xl font-extrabold text-white mt-0.5">{totalEvents}</div>
          </div>

          <div className={`p-2.5 rounded bg-slate-900/90 border ${
            activeHigh > 0 ? 'border-rose-500/60 bg-rose-950/20' : 'border-slate-800'
          }`}>
            <div className="text-[10px] text-rose-400 uppercase font-semibold flex items-center gap-1">
              {activeHigh > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>}
              CRITICAL / HIGH
            </div>
            <div className="text-xl font-extrabold text-rose-400 mt-0.5">{activeHigh}</div>
          </div>

        </div>

        {/* 6 Supported Hazard Classes Grid */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-1">
            SUPPORTED CLASSES & DETECTIONS
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-1.5 font-mono">
            {Object.keys(HAZARD_CONFIG).map((hKey) => {
              const cfg = HAZARD_CONFIG[hKey];
              const HazardIcon = cfg.icon;
              const count = hazardCounts[hKey] || 0;
              const isSelected = activeFilter.hazard === hKey;

              return (
                <button
                  key={hKey}
                  onClick={() => onSelectFilter({ hazard: isSelected ? '' : hKey })}
                  className={`p-2 rounded border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                      : 'border-slate-800/90 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <HazardIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cfg.color }} />
                    <span className="text-[11px] font-bold uppercase truncate">{cfg.label.split(' ')[0]}</span>
                  </div>
                  <span className="text-xs font-extrabold text-white bg-black/40 px-1.5 py-0.5 rounded border border-slate-800">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Classification Telemetry Stream */}
        <div className="flex-1 flex flex-col min-h-0 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mb-2 px-1">
            <span>DETECTION STREAM</span>
            <span>{activeFilter.hazard ? `FILTER: ${activeFilter.hazard.toUpperCase()}` : 'ALL HAZARDS'}</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {displayedDetections.length === 0 ? (
              <div className="py-8 text-center text-slate-500 font-mono text-xs italic">
                No active detections for this class.
              </div>
            ) : (
              displayedDetections.map((evt) => {
                const hazardCfg = getHazardConfig(evt.hazard);
                const prioCfg = PRIORITY_CONFIG[evt.priority] || PRIORITY_CONFIG.LOW;
                const HazardIcon = hazardCfg.icon;
                const isHigh = evt.priority === 'HIGH';

                return (
                  <div
                    key={evt.event_id}
                    className={`p-2 rounded border font-mono transition-all ${
                      isHigh ? 'border-rose-500/40 bg-rose-950/20' : 'border-slate-800 bg-slate-900/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <HazardIcon className="w-3.5 h-3.5" style={{ color: hazardCfg.color }} />
                        <span className="text-xs font-bold uppercase text-white truncate">{hazardCfg.label.split(' ')[0]}</span>
                      </div>
                      <span 
                        className="px-1.5 py-0.5 text-[9px] rounded font-bold uppercase"
                        style={{ backgroundColor: prioCfg.bg, color: prioCfg.color }}
                      >
                        {evt.priority}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                      <span>ID: <strong className="text-slate-200">{evt.event_id}</strong></span>
                      <span className="text-emerald-400 font-bold">{(evt.confidence * 100).toFixed(0)}% CONF</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-1">
                      <span>{evt.latitude.toFixed(4)}°, {evt.longitude.toFixed(4)}°</span>
                      <button
                        onClick={() => onSelectEvent(evt)}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> EVIDENCE
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
