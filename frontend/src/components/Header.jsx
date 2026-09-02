import React, { useState, useEffect } from 'react';
import { Radio, Wifi, Volume2, VolumeX, Sparkles, Navigation, Battery, Cpu, Clock, Layers } from 'lucide-react';
import { playAlertChime } from '../utils/hazardUtils';

export default function Header({ 
  isConnected, 
  soundEnabled, 
  setSoundEnabled, 
  onTriggerMock, 
  activeTab, 
  setActiveTab 
}) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-[#090d18] border-b border-slate-800/80 px-4 py-2.5 mb-3 shadow-xl">
      <div className="max-w-[1920px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-3">
        
        {/* Left: Command Center Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold font-mono tracking-tight text-white flex items-center gap-2">
                AI DISASTER RESPONSE COMMAND CENTER
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-700/60 text-cyan-400 font-bold uppercase">
                GROUND STATION v1.0
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
              <span>SIH DRONE PAYLOAD CONSUMER</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <Wifi className="w-3 h-3" /> ENDPOINT: 0.0.0.0:5000
              </span>
            </p>
          </div>
        </div>

        {/* Center: System Telemetry Status Indicators */}
        <div className="hidden lg:flex items-center gap-2 font-mono text-[11px]">
          
          {/* Drone/RPi Status */}
          <div className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-800 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">DRONE:</span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>

          {/* GPS Status */}
          <div className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-800 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">GPS:</span>
            <span className="text-amber-300 font-bold">3D LOCK</span>
          </div>

          {/* Network Channel */}
          <div className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-800 flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">NETWORK:</span>
            <span className="text-blue-300 font-bold">WI-FI / LORA</span>
          </div>

          {/* Battery Status */}
          <div className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-800 flex items-center gap-1.5">
            <Battery className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">BATTERY:</span>
            <span className="text-slate-300 font-bold">BUS POWER (N/A)</span>
          </div>

          {/* Mission Mode */}
          <div className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-800 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400">MISSION:</span>
            <span className="text-purple-300 font-bold">ACTIVE SURVEILLANCE</span>
          </div>

        </div>

        {/* Right: Actions, Navigation & Live Status */}
        <div className="flex items-center gap-2.5 font-mono text-xs">

          {/* Navigation Tab Buttons */}
          <div className="flex items-center bg-slate-950 p-1 rounded border border-slate-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              CONSOLE
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              MISSION LOGS
            </button>
            <button
              onClick={() => setActiveTab('receiver')}
              className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
                activeTab === 'receiver'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              NET SETUP
            </button>
          </div>

          {/* Live Clock */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{timeStr}</span>
          </div>

          {/* WebSocket Status Badge */}
          <div className={`px-2.5 py-1 rounded border text-[11px] font-bold flex items-center gap-1.5 ${
            isConnected 
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400' 
              : 'bg-rose-950/60 border-rose-500/50 text-rose-400 animate-pulse'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            {isConnected ? 'LIVE DATA' : 'RECONNECTING'}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playAlertChime();
            }}
            title={soundEnabled ? 'Alert Audio On' : 'Alert Audio Muted'}
            className={`p-1.5 rounded border transition-all ${
              soundEnabled
                ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Emit Mock Event Button */}
          <button
            onClick={() => onTriggerMock('WIFI')}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] shadow transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>EMIT EVENT</span>
          </button>

        </div>

      </div>
    </header>
  );
}
