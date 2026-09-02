import React from 'react';
import { AlertCircle, Activity, Wifi, Radio, Layers } from 'lucide-react';
import { HAZARD_CONFIG } from '../utils/hazardUtils';

export default function StatsOverview({ stats, activeFilter, onSelectFilter }) {
  const totalEvents = stats.total_events || 0;
  const activeHigh = stats.active_high_priority || 0;
  const hazardCounts = stats.hazard_breakdown || {};
  const channelCounts = stats.channel_breakdown || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Total Incidents Card */}
      <div 
        onClick={() => onSelectFilter({ hazard: '', priority: '' })}
        className={`glass-panel p-4 cursor-pointer transition-all ${
          !activeFilter.hazard && !activeFilter.priority ? 'border-cyan-500/50 bg-cyan-950/20' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-slate-400 tracking-wider uppercase">
            Total Incidents
          </span>
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {totalEvents}
          </span>
          <span className="text-xs font-mono text-cyan-400">STORED IN DB</span>
        </div>
      </div>

      {/* High Priority Alerts Card */}
      <div 
        onClick={() => onSelectFilter({ priority: 'HIGH' })}
        className={`glass-panel p-4 cursor-pointer transition-all ${
          activeHigh > 0 ? 'border-rose-500/60 bg-rose-950/20 alert-flash' : ''
        } ${activeFilter.priority === 'HIGH' ? 'ring-1 ring-rose-500' : ''}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-rose-300 tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            High Priority Alerts
          </span>
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-3xl font-extrabold font-mono text-rose-400 tracking-tight">
            {activeHigh}
          </span>
          <span className="text-xs font-mono text-rose-300/80">URGENT ACTION</span>
        </div>
      </div>

      {/* Hazard Classes Breakdown */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Hazard Breakdown
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {Object.keys(HAZARD_CONFIG).map((hKey) => {
            const cfg = HAZARD_CONFIG[hKey];
            const count = hazardCounts[hKey] || 0;
            const isSelected = activeFilter.hazard === hKey;
            return (
              <button
                key={hKey}
                onClick={() => onSelectFilter({ hazard: isSelected ? '' : hKey })}
                className={`p-1.5 rounded-lg border text-left transition-all ${
                  isSelected ? 'border-amber-400 bg-amber-950/30' : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80'
                }`}
              >
                <div className="text-[10px] font-mono font-bold uppercase truncate" style={{ color: cfg.color }}>
                  {cfg.label.split(' ')[0]}
                </div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {count}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Telemetry Channel Card (Wi-Fi vs LoRa) */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-slate-400 tracking-wider uppercase">
            Ingestion Channels
          </span>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Wifi className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 font-mono">
          <div 
            onClick={() => onSelectFilter({ channel: activeFilter.channel === 'WIFI' ? '' : 'WIFI' })}
            className={`p-2 rounded-lg border cursor-pointer ${
              activeFilter.channel === 'WIFI' ? 'border-cyan-400 bg-cyan-950/40' : 'border-slate-800 bg-slate-900/60'
            }`}
          >
            <div className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
              <Wifi className="w-3 h-3" /> WI-FI (FULL)
            </div>
            <div className="text-lg font-bold text-white mt-1">{channelCounts.WIFI || 0}</div>
          </div>

          <div 
            onClick={() => onSelectFilter({ channel: activeFilter.channel === 'LORA' ? '' : 'LORA' })}
            className={`p-2 rounded-lg border cursor-pointer ${
              activeFilter.channel === 'LORA' ? 'border-amber-400 bg-amber-950/40' : 'border-slate-800 bg-slate-900/60'
            }`}
          >
            <div className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
              <Radio className="w-3 h-3" /> LORA (TELEMETRY)
            </div>
            <div className="text-lg font-bold text-white mt-1">{channelCounts.LORA || 0}</div>
          </div>
        </div>
      </div>

    </div>
  );
}
