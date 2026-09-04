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

  const renderGroup = (priorityKey, title, items, badgeColor, borderColor, textColor) => {
    const isCategorySelected = mapFilter === priorityKey;

    return (
      <div className="space-y-1">
        {/* Clickable Priority Category Header */}
        <button
          onClick={() => onSelectPriorityCategory && onSelectPriorityCategory(priorityKey)}
          className={`w-full flex items-center justify-between px-2.5 py-1 rounded border text-[11px] font-bold tracking-wider transition-all cursor-pointer text-left ${
            isCategorySelected
              ? 'bg-amber-950/90 border-amber-500 shadow-sm ring-1 ring-amber-500/40'
              : `bg-slate-900/80 ${borderColor} hover:bg-slate-800/80`
          }`}
          title={`Click to filter map to all active ${title} priority events`}
        >
          <span className={textColor}>● {title} PRIORITY</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${badgeColor} text-black font-extrabold`}>
            {items.length}
          </span>
        </button>

        {items.length === 0 ? (
          <div className="text-[11px] text-slate-500 italic px-2 py-1">No active {title.toLowerCase()} priority events</div>
        ) : (
          <div className="space-y-1 pl-1">
            {items.map((evt) => {
              const isSelected = selectedEvent && selectedEvent.event_id === evt.event_id && mapFilter === 'SINGLE_EVENT';
              const Icon = getHazardIcon(evt.hazard);
              const hazardCfg = getHazardConfig(evt.hazard);
              const confPct = Math.round((evt.confidence || 0) * 100);

              return (
                <button
                  key={evt.event_id}
                  onClick={() => onSelectPriorityEvent(evt)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-all cursor-pointer border text-left ${
                    isSelected
                      ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold shadow-md ring-1 ring-amber-500/50'
                      : 'bg-slate-900/50 hover:bg-slate-800/80 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: hazardCfg.color }} />
                    <span className="font-mono font-bold truncate">
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
                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-600'}`} />
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
    <div className="tactical-panel h-full flex flex-col justify-between p-3 bg-[#0a0e19] border border-slate-800/80 font-sans">
      <div className="space-y-3 overflow-y-auto pr-1">
        
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              ACTIVE PRIORITY EVENTS
            </h2>
          </div>
          
          <button
            onClick={onClearFilter}
            className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 cursor-pointer"
            title="Restore all active event markers on map"
          >
            [ ALL ({activeEvents.length}) ]
          </button>
        </div>

        {/* Priority Groups */}
        <div className="space-y-3">
          {renderGroup('HIGH_PRIORITY', 'HIGH', highEvents, 'bg-rose-500', 'border-rose-900/60', 'text-rose-400')}
          {renderGroup('MEDIUM_PRIORITY', 'MEDIUM', mediumEvents, 'bg-amber-500', 'border-amber-900/60', 'text-amber-400')}
          {renderGroup('LOW_PRIORITY', 'LOW', lowEvents, 'bg-emerald-500', 'border-emerald-900/60', 'text-emerald-400')}
        </div>

      </div>

      {/* Helper text */}
      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
        <span>HEADER = CATEGORY FILTER | ROW = SINGLE EVENT</span>
        {mapFilter === 'SINGLE_EVENT' && (
          <span className="text-amber-400 font-bold">ISOLATED MODE</span>
        )}
      </div>
    </div>
  );
}
