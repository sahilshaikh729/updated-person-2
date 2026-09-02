import React from 'react';
import { Database, Server, Wifi, Cpu, Clock, Activity } from 'lucide-react';

export default function SystemStatusBar({ isConnected, stats, lastUpdate }) {
  const totalEvents = stats?.total_events || 0;
  const formattedLastUpdate = lastUpdate
    ? new Date(lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'STANDBY';

  return (
    <div className="bg-[#050811] border-t border-slate-800/90 px-4 py-1.5 font-mono text-[11px] text-slate-400">
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Status Pills Group */}
        <div className="flex flex-wrap items-center gap-4">
          
          {/* API Status */}
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>API:</span>
            <span className="text-emerald-400 font-bold">ONLINE (PORT 5000)</span>
          </div>

          <span className="text-slate-700">•</span>

          {/* RPi Connection Listener */}
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>PI RECEIVER:</span>
            <span className="text-slate-200 font-bold">LISTENING (0.0.0.0:5000)</span>
          </div>

          <span className="text-slate-700">•</span>

          {/* Database */}
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>DATABASE:</span>
            <span className="text-slate-200 font-bold">SQLITE (WAL)</span>
          </div>

          <span className="text-slate-700">•</span>

          {/* WebSocket */}
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>WEBSOCKET:</span>
            <span className={isConnected ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold animate-pulse'}>
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

        </div>

        {/* Live Stream Metrics & Last Update */}
        <div className="flex items-center gap-4">
          
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>EVENT STREAM:</span>
            <span className="text-white font-bold">{totalEvents} RECEIVED</span>
          </div>

          <span className="text-slate-700">•</span>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>LAST UPDATE:</span>
            <span className="text-cyan-300 font-bold">{formattedLastUpdate}</span>
          </div>

        </div>

      </div>
    </div>
  );
}
