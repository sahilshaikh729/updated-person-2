import React, { useState, useEffect } from 'react';
import { Radio, Wifi, Volume2, VolumeX, Sparkles, Navigation, Clock, Globe, BatteryCharging, Gauge, ArrowUp, UserCheck } from 'lucide-react';
import { playAlertChime } from '../utils/hazardUtils';

export default function Header({ 
  isConnected, 
  soundEnabled, 
  setSoundEnabled, 
  onTriggerMock, 
  isOnline = true,
  dronePosition = null
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

  const alt = dronePosition?.altitude ? dronePosition.altitude.toFixed(1) : '45.0';
  const speed = dronePosition?.speed ? dronePosition.speed.toFixed(1) : '12.4';
  const batteryPct = dronePosition?.battery || 88;

  return (
    <header className="bg-[#090d18] border-b border-slate-800/80 px-4 py-2 shadow-md font-sans">
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Left: Command Station Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-emerald-950/90 border border-emerald-500/50 text-emerald-400">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs md:text-sm font-extrabold tracking-tight text-white uppercase font-sans">
                DISASTER RESPONSE GROUND STATION
              </h1>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 uppercase">
                RESCUE CONSOLE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans flex items-center gap-1.5 mt-0.5">
              <span>PERSON DETECTION & LOCATION MONITORING</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-medium">SIH DRONE PAYLOAD SYSTEM</span>
            </p>
          </div>
        </div>

        {/* Center/Right: Telemetry Metrics Header Bar */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-sans">

          {/* 1. BATTERY Indicator */}
          <div className="px-2 py-1 rounded bg-slate-900 border border-slate-800 flex items-center gap-1 text-[11px]">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 font-medium">BATTERY:</span>
            <span className="text-emerald-300 font-bold">{batteryPct}%</span>
          </div>

          {/* 2. GPS 3D LOCK Indicator */}
          <div className="px-2 py-1 rounded bg-slate-900 border border-slate-800 flex items-center gap-1 text-[11px]">
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 font-medium">GPS:</span>
            <span className="text-amber-300 font-bold">3D LOCK</span>
          </div>

          {/* 3. SiK LINK Indicator */}
          <div className="px-2 py-1 rounded bg-slate-900 border border-slate-800 flex items-center gap-1 text-[11px]">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400 font-medium">SiK LINK:</span>
            <span className="text-blue-300 font-bold">RF CONNECTED</span>
          </div>

          {/* 4. ALTITUDE Indicator */}
          <div className="px-2 py-1 rounded bg-slate-900 border border-slate-800 flex items-center gap-1 text-[11px]">
            <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 font-medium">ALT:</span>
            <span className="text-cyan-300 font-bold">{alt}m</span>
          </div>

          {/* 5. SPEED Indicator */}
          <div className="px-2 py-1 rounded bg-slate-900 border border-slate-800 flex items-center gap-1 text-[11px]">
            <Gauge className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400 font-medium">SPEED:</span>
            <span className="text-purple-300 font-bold">{speed}m/s</span>
          </div>

          {/* 6. INTERNET: ONLINE / OFFLINE Status Badge */}
          <div className={`px-2 py-1 rounded border flex items-center gap-1 text-[11px] ${
            isOnline 
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
              : 'bg-amber-950/80 border-amber-500/50 text-amber-300 font-bold animate-pulse'
          }`}>
            <Globe className="w-3.5 h-3.5 text-current" />
            <span className="font-bold">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>

          {/* UTC Clock */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{timeStr}</span>
          </div>

          {/* Sound Audio Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playAlertChime();
            }}
            title={soundEnabled ? 'Alert Audio On' : 'Alert Audio Muted'}
            className={`p-1 rounded border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-slate-900 border-slate-700 text-emerald-400 hover:bg-slate-800'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Emit Mock Event Button */}
          <button
            onClick={() => onTriggerMock('WIFI')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-semibold text-[11px] shadow transition-all cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>EMIT EVENT</span>
          </button>

        </div>

      </div>
    </header>
  );
}
