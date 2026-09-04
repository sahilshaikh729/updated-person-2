import React from 'react';
import { UserCheck, Flame, Waves, Wind, Mountain, Package, Layers, ShieldAlert } from 'lucide-react';

export default function DetectionsSidebar({ 
  events = [], 
  mapFilter = 'ALL', 
  onSelectCategoryFilter,
  onNavigateToCategoryView
}) {
  const activeEvents = events.filter(e => e.status !== 'RESOLVED');

  const getCount = (category) => {
    if (category === 'ALL') return activeEvents.length;
    return activeEvents.filter(e => (e.hazard || '').toLowerCase() === category.toLowerCase()).length;
  };

  const categories = [
    { id: 'fire', label: 'Fire', icon: Flame, color: 'text-amber-500' },
    { id: 'flood', label: 'Flood', icon: Waves, color: 'text-blue-400' },
    { id: 'smoke', label: 'Smoke', icon: Wind, color: 'text-slate-400' },
    { id: 'landslide', label: 'Landslide', icon: Mountain, color: 'text-orange-400' },
    { id: 'debris', label: 'Debris', icon: Package, color: 'text-yellow-600' },
  ];

  return (
    <div className="tactical-panel h-full flex flex-col justify-between p-3 bg-[#0a0e19] border border-slate-800/80 font-sans">
      <div className="space-y-3">
        
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              DETECTIONS
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono font-semibold">
            {activeEvents.length} ACTIVE
          </span>
        </div>

        {/* ALL Option */}
        <button
          onClick={() => onSelectCategoryFilter('ALL')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer border ${
            mapFilter === 'ALL'
              ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
              : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>ALL ACTIVE MARKERS</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-200 font-bold border border-slate-700">
            {getCount('ALL')}
          </span>
        </button>

        {/* PRIMARY FOCUS: PERSON Category */}
        <div className="pt-1">
          <button
            onClick={() => onSelectCategoryFilter('person')}
            onDoubleClick={() => onNavigateToCategoryView && onNavigateToCategoryView('person')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-bold transition-all cursor-pointer border ${
              mapFilter.toLowerCase() === 'person'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="tracking-wide">PERSON</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500 text-black font-extrabold">
              {getCount('person')}
            </span>
          </button>
        </div>

        {/* HAZARDS Subheader */}
        <div className="pt-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1.5">
            HAZARDS
          </div>

          <div className="space-y-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = mapFilter.toLowerCase() === cat.id;
              const count = getCount(cat.id);

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategoryFilter(cat.id)}
                  onDoubleClick={() => onNavigateToCategoryView && onNavigateToCategoryView(cat.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-800 text-white border-slate-600 shadow-sm font-semibold'
                      : 'bg-slate-900/40 text-slate-300 border-slate-800/80 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                    <span>{cat.label}</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Navigation Tip */}
      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span>SINGLE-CLICK:</span>
          <span className="text-slate-300 font-medium">FILTER MAP</span>
        </div>
        <div className="flex items-center justify-between">
          <span>DOUBLE-CLICK:</span>
          <span className="text-emerald-400 font-medium">VIEW FULL LIST</span>
        </div>
      </div>
    </div>
  );
}
