import React from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  Map, 
  Image, 
  Globe, 
  Radio, 
  History, 
  Settings,
  ShieldAlert
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, personCount = 0 }) {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'detections', label: 'Person Detections', icon: UserCheck, badge: personCount },
    { id: 'history', label: 'Missions', icon: History },
    { id: 'receiver', label: 'Net & SiK Setup', icon: Radio },
  ];

  return (
    <aside className="w-14 md:w-52 bg-[#0a0e19] border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none">
      
      {/* Top Branding Section */}
      <div>
        <div className="p-3 border-b border-slate-800/80 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-400 shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div className="hidden md:block overflow-hidden">
            <h1 className="text-xs font-bold text-white tracking-wide truncate">
              GROUND STATION
            </h1>
            <p className="text-[10px] text-emerald-400 font-medium truncate">
              RESCUE MONITORING
            </p>
          </div>
        </div>

        {/* Navigation Item List */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={item.label}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="hidden md:inline truncate">{item.label}</span>
                </div>

                {item.badge > 0 && (
                  <span className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-black">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Card */}
      <div className="p-2 border-t border-slate-800/80 hidden md:block">
        <div className="p-2 rounded bg-slate-900/60 border border-slate-800/60 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>MISSION:</span>
            <span className="text-emerald-400 font-semibold">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>TARGET:</span>
            <span className="text-white font-medium">PERSON RESCUE</span>
          </div>
        </div>
      </div>

    </aside>
  );
}
