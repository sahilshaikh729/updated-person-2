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
    <div className="tactical-panel h-full flex flex-col justify-between p-3 bg-[#0c1017] border border-slate-800/90 font-sans select-none">
      <div className="space-y-2.5">
        
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-100">
              DETECTIONS
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {activeEvents.length} ACTIVE
          </span>
        </div>

        {/* ALL Option */}
        <button
          onClick={() => onSelectCategoryFilter('ALL')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer border ${
            mapFilter === 'ALL'
              ? 'bg-slate-800 text-slate-100 border-slate-600 font-semibold'
              : 'bg-slate-900/50 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <span>ALL ACTIVE MARKERS</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            {getCount('ALL')}
          </span>
        </button>

        {/* PRIMARY FOCUS: PERSON Category */}
        <div className="pt-0.5">
          <button
            onClick={() => onSelectCategoryFilter('person')}
            onDoubleClick={() => onNavigateToCategoryView && onNavigateToCategoryView('person')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer border ${
              mapFilter.toLowerCase() === 'person'
                ? 'bg-red-950/60 text-red-200 border-red-700 font-semibold'
                : 'bg-red-950/30 text-red-300 border-red-900/60 hover:bg-red-900/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-red-400" />
              <span className="tracking-wide">PERSON (RESCUE)</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-900/80 text-red-200 border border-red-700 font-mono font-bold">
              {getCount('person')}
            </span>
          </button>
        </div>

        {/* HAZARDS Subheader */}
        <div className="pt-1">
          <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400 px-1 mb-1">
            HAZARD CATEGORIES
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
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-800 text-slate-100 border-slate-600 font-medium'
                      : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cat.label}</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Navigation Tip */}
      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-0.5">
        <div className="flex items-center justify-between">
          <span>SINGLE-CLICK:</span>
          <span className="text-slate-300">FILTER MAP</span>
        </div>
        <div className="flex items-center justify-between">
          <span>DOUBLE-CLICK:</span>
          <span className="text-slate-300">VIEW HISTORY</span>
        </div>
      </div>
    </div>
  );
}
