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
    <header className="bg-[#0b0f17] border-b border-slate-800/90 px-3.5 py-1.5 font-sans select-none">
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        
        {/* Left: Command Station Title & Subtitle */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded bg-slate-900 border border-slate-700/80 text-blue-400 shrink-0">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-semibold tracking-wide text-slate-100 uppercase">
                DISASTER RESPONSE GROUND STATION
              </h1>
              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700/80 text-slate-300 uppercase">
                RESCUE CONSOLE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
              <span>PERSON DETECTION & LOCATION MONITORING</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-medium">SIH DRONE PAYLOAD SYSTEM</span>
            </p>
          </div>
        </div>

        {/* Center/Right: Telemetry Metrics Header Bar */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs font-sans">

          {/* 1. BATTERY Indicator */}
          <div className="px-2 py-0.5 rounded-sm bg-slate-900/80 border border-slate-800 flex items-center gap-1.5 text-[11px]">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 font-medium">BAT:</span>
            <span className="text-slate-100 font-semibold">{batteryPct}%</span>
          </div>

          {/* 2. GPS 3D LOCK Indicator */}
          <div className="px-2 py-0.5 rounded-sm bg-slate-900/80 border border-slate-800 flex items-center gap-1.5 text-[11px]">
            <Navigation className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">GPS:</span>
            <span className="text-slate-100 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 3D LOCK
            </span>
          </div>

          {/* 3. SiK LINK Indicator */}
          <div className="px-2 py-0.5 rounded-sm bg-slate-900/80 border border-slate-800 flex items-center gap-1.5 text-[11px]">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400 font-medium">SiK:</span>
            <span className="text-slate-100 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> CONNECTED
            </span>
          </div>

          {/* 4. ALTITUDE Indicator */}
          <div className="px-2 py-0.5 rounded-sm bg-slate-900/80 border border-slate-800 flex items-center gap-1.5 text-[11px]">
            <ArrowUp className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">ALT:</span>
            <span className="text-slate-100 font-semibold">{alt}m</span>
          </div>

          {/* 5. SPEED Indicator */}
          <div className="px-2 py-0.5 rounded-sm bg-slate-900/80 border border-slate-800 flex items-center gap-1.5 text-[11px]">
            <Gauge className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">SPEED:</span>
            <span className="text-slate-100 font-semibold">{speed}m/s</span>
          </div>

          {/* 6. INTERNET: ONLINE / OFFLINE Status Badge */}
          <div className={`px-2 py-0.5 rounded-sm border flex items-center gap-1.5 text-[11px] ${
            isOnline 
              ? 'bg-slate-900/80 border-slate-800 text-slate-200' 
              : 'bg-amber-950/40 border-amber-800/60 text-amber-300 font-semibold'
          }`}>
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-200 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          {/* UTC Clock */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-sm bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 font-mono">
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
            className={`p-1 rounded-sm border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Emit Mock Event Button */}
          <button
            onClick={() => onTriggerMock('WIFI')}
            className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-blue-700 hover:bg-blue-600 text-white font-medium text-[11px] border border-blue-600 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-blue-200" />
            <span>EMIT TEST EVENT</span>
          </button>

        </div>

      </div>
    </header>
  );
}
