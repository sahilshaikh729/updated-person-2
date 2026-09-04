import React from 'react';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, ChevronRight, User, Flame, Waves, Wind, Mountain, Package } from 'lucide-react';
import { getHazardConfig } from '../utils/hazardUtils';

function getHazardIcon(hazard) {
  const h = (hazard || '').toLowerCase();
  switch (h) {
    case 'person': return User;
    case 'fire': return Flame;
    case 'flood': return Waves;
    case 'smoke': return Wind;
    case 'landslide': return Mountain;
    case 'debris': return Package;
    default: return AlertTriangle;
  }
}

export default function PriorityPanel({ 
  events = [], 
  selectedEvent, 
  onSelectPriorityEvent, 
  onSelectPriorityCategory,
  onClearFilter,
  mapFilter
}) {
  // Only active (unresolved/acknowledged) events in Priority list
  const activeEvents = events.filter(e => e.status !== 'RESOLVED');

  const highEvents = activeEvents.filter(e => e.priority === 'HIGH');
  const mediumEvents = activeEvents.filter(e => e.priority === 'MEDIUM');
  const lowEvents = activeEvents.filter(e => e.priority === 'LOW');

  const renderGroup = (priorityKey, title, items, badgeClass, borderClass, textClass) => {
    const isCategorySelected = mapFilter === priorityKey;

    return (
      <div className="space-y-1">
        {/* Clickable Priority Category Header */}
        <button
          onClick={() => onSelectPriorityCategory && onSelectPriorityCategory(priorityKey)}
          className={`w-full flex items-center justify-between px-2.5 py-1 rounded-sm text-[11px] font-semibold tracking-wide transition-colors cursor-pointer text-left border ${
            isCategorySelected
              ? 'bg-slate-800 border-slate-600 text-slate-100'
              : `bg-slate-900/60 ${borderClass} hover:bg-slate-800/60`
          }`}
          title={`Filter map to active ${title} priority events`}
        >
          <span className={textClass}>● {title} PRIORITY</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] ${badgeClass} font-mono font-bold`}>
            {items.length}
          </span>
        </button>

        {items.length === 0 ? (
          <div className="text-[10px] text-slate-500 italic px-2 py-0.5">No active {title.toLowerCase()} priority events</div>
        ) : (
          <div className="space-y-1 pl-1">
            {items.map((evt) => {
              const isSelected = selectedEvent && selectedEvent.event_id === evt.event_id && mapFilter === 'SINGLE_EVENT';
              const Icon = getHazardIcon(evt.hazard);
              const confPct = Math.round((evt.confidence || 0) * 100);

              return (
                <button
                  key={evt.event_id}
                  onClick={() => onSelectPriorityEvent(evt)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs transition-colors cursor-pointer border text-left ${
                    isSelected
                      ? 'bg-slate-800 border-blue-500 text-slate-100 font-semibold'
                      : 'bg-slate-900/40 hover:bg-slate-800/50 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="font-mono font-medium truncate">
                      {(evt.hazard || 'EVENT').toUpperCase()}-{evt.event_id.slice(-4)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {confPct}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-slate-600'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tactical-panel h-full flex flex-col justify-between p-3 bg-[#0c1017] border border-slate-800/90 font-sans select-none">
      <div className="space-y-2.5 overflow-y-auto pr-0.5">
        
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-300" />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-100">
              PRIORITY EVENTS
            </h2>
          </div>
          
          <button
            onClick={onClearFilter}
            className="text-[10px] font-medium px-2 py-0.5 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
            title="Restore all active event markers on map"
          >
            [ ALL ({activeEvents.length}) ]
          </button>
        </div>

        {/* Priority Groups */}
        <div className="space-y-2.5">
          {renderGroup('HIGH_PRIORITY', 'HIGH', highEvents, 'bg-red-950 text-red-200 border border-red-800/60', 'border-red-950/60', 'text-red-400')}
          {renderGroup('MEDIUM_PRIORITY', 'MEDIUM', mediumEvents, 'bg-amber-950 text-amber-200 border border-amber-800/60', 'border-amber-950/60', 'text-amber-400')}
          {renderGroup('LOW_PRIORITY', 'LOW', lowEvents, 'bg-slate-800 text-slate-300 border border-slate-700', 'border-slate-800', 'text-slate-400')}
        </div>

      </div>

      {/* Helper text */}
      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between font-sans">
        <span>HEADER = CATEGORY | ROW = SINGLE EVENT</span>
        {mapFilter === 'SINGLE_EVENT' && (
          <span className="text-blue-400 font-semibold">ISOLATED MODE</span>
        )}
      </div>
    </div>
  );
}
