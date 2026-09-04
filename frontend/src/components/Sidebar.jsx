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
    <aside className="w-14 md:w-52 bg-[#0c1017] border-r border-slate-800/90 flex flex-col justify-between shrink-0 select-none font-sans">
      
      {/* Top Branding Section */}
      <div>
        <div className="p-3 border-b border-slate-800/80 flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded bg-slate-900 border border-slate-700/80 text-blue-400 shrink-0">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <div className="hidden md:block overflow-hidden">
            <h1 className="text-xs font-semibold text-slate-100 tracking-wide truncate">
              GROUND STATION
            </h1>
            <p className="text-[10px] text-slate-400 font-medium truncate">
              RESCUE MONITORING
            </p>
          </div>
        </div>

        {/* Navigation Item List */}
        <nav className="p-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-800/90 text-slate-100 font-semibold border-l-2 border-blue-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 font-normal'
                }`}
                title={item.label}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span className="hidden md:inline truncate">{item.label}</span>
                </div>

                {item.badge > 0 && (
                  <span className="hidden md:inline-block px-1.5 py-0.2 text-[10px] font-semibold rounded bg-red-900/70 text-red-200 border border-red-800/50">
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
        <div className="p-2 rounded-sm bg-slate-900/40 border border-slate-800/60 text-[10px] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-medium">SYSTEM STATUS:</span>
            <span className="text-emerald-400 font-medium">ONLINE</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-medium">OPERATIONAL MODE:</span>
            <span className="text-slate-200 font-medium">TACTICAL</span>
          </div>
        </div>
      </div>

    </aside>
  );
}
