import React from 'react';
import { Database, Server, Wifi, Cpu, Clock, Activity } from 'lucide-react';

export default function SystemStatusBar({ isConnected, stats, lastUpdate }) {
  const totalEvents = stats?.total_events || 0;
  const formattedLastUpdate = lastUpdate
    ? new Date(lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'STANDBY';

  return (
    <div className="bg-[#070a10] border-t border-slate-800/90 px-3.5 py-1 font-mono text-[10px] text-slate-400 select-none">
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Status Pills Group */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* API Status */}
          <div className="flex items-center gap-1">
            <Server className="w-3 h-3 text-slate-500" />
            <span className="text-slate-400">API:</span>
            <span className="text-slate-200 font-semibold">ONLINE (:5000)</span>
          </div>

          <span className="text-slate-700">•</span>

          {/* RPi Connection Listener */}
          <div className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-slate-500" />
            <span className="text-slate-400">PI CONSUMER:</span>
            <span className="text-slate-200 font-semibold">LISTENING</span>
          </div>

          <span className="text-slate-700">•</span>

          {/* Database */}
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3 text-slate-500" />
            <span className="text-slate-400">DB:</span>
            <span className="text-slate-200 font-semibold">SQLITE (ACTIVE)</span>
          </div>

          <span className="text-slate-700">•</span>

          {/* WebSocket */}
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-slate-500" />
            <span className="text-slate-400">WS:</span>
            <span className={isConnected ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

        </div>

        {/* Live Stream Metrics & Last Update */}
        <div className="flex items-center gap-3">
          
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-slate-500" />
            <span className="text-slate-400">EVENTS:</span>
            <span className="text-slate-200 font-semibold">{totalEvents} STORED</span>
          </div>

          <span className="text-slate-700">•</span>

          <div className="flex items-center gap-1 text-slate-300">
            <Clock className="w-3 h-3 text-slate-500" />
            <span className="text-slate-400">LAST SYNC:</span>
            <span className="text-slate-200 font-semibold">{formattedLastUpdate}</span>
          </div>

        </div>

      </div>
    </div>
  );
}
