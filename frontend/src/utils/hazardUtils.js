import { Flame, CloudRain, Wind, Mountain, AlertTriangle, UserCheck } from 'lucide-react';

export const HAZARD_CONFIG = {
  fire: {
    label: 'FIRE',
    code: 2,
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.4)',
    icon: Flame,
    description: 'Active thermal hotspot / wildfire detected'
  },
  smoke: {
    label: 'SMOKE',
    code: 1,
    color: '#9ca3af',
    bg: 'rgba(156, 163, 175, 0.15)',
    border: 'rgba(156, 163, 175, 0.4)',
    icon: Wind,
    description: 'Dense smoke plume / emission detected'
  },
  flood: {
    label: 'FLOOD',
    code: 0,
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.15)',
    border: 'rgba(6, 182, 212, 0.4)',
    icon: CloudRain,
    description: 'Water submergence / flash flood zone'
  },
  debris: {
    label: 'DEBRIS',
    code: 3,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.4)',
    icon: AlertTriangle,
    description: 'Structural collapse / road blockage'
  },
  landslide: {
    label: 'LANDSLIDE',
    code: 4,
    color: '#84cc16',
    bg: 'rgba(132, 204, 22, 0.15)',
    border: 'rgba(132, 204, 22, 0.4)',
    icon: Mountain,
    description: 'Slope failure / rockfall area'
  },
  person: {
    label: 'PERSON IN DISTRESS',
    code: 5,
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.4)',
    icon: UserCheck,
    description: 'Human casualty / survivor detected'
  }
};

export const PRIORITY_CONFIG = {
  HIGH: {
    label: 'HIGH PRIORITY',
    color: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.2)',
    border: 'rgba(244, 63, 94, 0.5)'
  },
  MEDIUM: {
    label: 'MEDIUM PRIORITY',
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.2)',
    border: 'rgba(251, 191, 36, 0.5)'
  },
  LOW: {
    label: 'LOW PRIORITY',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.2)',
    border: 'rgba(56, 189, 248, 0.5)'
  }
};

export function getHazardConfig(hazardInput) {
  if (typeof hazardInput === 'string') {
    const key = hazardInput.toLowerCase();
    if (HAZARD_CONFIG[key]) return HAZARD_CONFIG[key];
  }
  if (typeof hazardInput === 'number') {
    const keys = Object.keys(HAZARD_CONFIG);
    const match = keys.find(k => HAZARD_CONFIG[k].code === hazardInput);
    if (match) return HAZARD_CONFIG[match];
  }
  return HAZARD_CONFIG.person;
}

/**
 * Audio Synthesizer Chime for Emergency Alerts (Web Audio API)
 */
export function playAlertChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // A6 note

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Ignore audio permission blocks
  }
}
