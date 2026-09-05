/**
 * SpeedSlider — Floating glass panel for race playback and speed controls.
 *
 * Provides:
 * - Start / Pause / Resume / Reset buttons with audio feedback & hotkeys
 * - Live status indicator (READY, RACING, PAUSED, FINISHED, NO AGENTS)
 * - Quick speed multiplier chips (0.5x, 1x, 2x, 5x, MAX)
 * - Fine-grained speed slider (5ms - 250ms)
 * - Single-step tick button for debugging
 *
 * @module ui/SpeedSlider
 */

import { useRaceStore } from '../state/raceStore';
import { useAgentStore } from '../state/agentStore';
import { playClick, playStartFanfare, playStepTick } from '../utils/sound';
import { Play, Pause, RotateCcw, FastForward, StepForward } from 'lucide-react';

const SPEED_PRESETS = [
  { label: '0.5x', delay: 150 },
  { label: '1x', delay: 50 },
  { label: '2x', delay: 25 },
  { label: '5x', delay: 10 },
  { label: 'MAX', delay: 5 },
] as const;

export function SpeedSlider() {
  const status = useRaceStore((s) => s.status);
  const speed = useRaceStore((s) => s.speed);
  const setSpeed = useRaceStore((s) => s.setSpeed);
  const startRace = useRaceStore((s) => s.startRace);
  const pauseRace = useRaceStore((s) => s.pauseRace);
  const resetRace = useRaceStore((s) => s.resetRace);
  const tick = useRaceStore((s) => s.tick);

  const agents = useAgentStore((s) => s.agents);
  const agentsCount = agents.length;
  const canStart = agentsCount > 0;

  // Derive status badge
  let statusColor: string;
  let statusText: string;
  let isPulsing = false;

  if (agentsCount === 0) {
    statusColor = 'bg-slate-500';
    statusText = 'NO AGENTS';
  } else if (status === 'running') {
    statusColor = 'bg-emerald-400';
    statusText = 'RACING';
    isPulsing = true;
  } else if (status === 'finished') {
    statusColor = 'bg-slate-300';
    statusText = 'FINISHED';
  } else {
    const anyExplored = agents.some((a) => a.visitedNodes.size > 1);
    if (anyExplored) {
      statusColor = 'bg-amber-400';
      statusText = 'PAUSED';
    } else {
      statusColor = 'bg-blue-400';
      statusText = 'READY';
    }
  }

  const handlePlayToggle = () => {
    if (status === 'running') {
      pauseRace();
      playClick();
    } else {
      startRace();
      playStartFanfare();
    }
  };

  const handleTick = () => {
    tick();
    playStepTick();
  };

  const handleReset = () => {
    resetRace();
    playClick();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-glass-bg backdrop-blur-md border border-glass-border rounded-panel px-4 py-2 flex flex-col sm:flex-row items-center gap-3 z-10 text-glass-text shadow-2xl">
      {/* Status indicator & Playback controls */}
      <div className="flex items-center gap-2">
        {/* Status Pill */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-wider mr-1">
          <span
            className={`w-2 h-2 rounded-full ${statusColor} ${
              isPulsing ? 'animate-ping inline-block opacity-75' : ''
            }`}
          />
          <span className="text-white/80">{statusText}</span>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={handlePlayToggle}
          disabled={!canStart}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all shadow-md ${
            !canStart
              ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
              : status === 'running'
              ? 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-400/40'
              : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/40'
          }`}
          title={!canStart ? 'Add at least one agent first' : status === 'running' ? 'Pause Race [Space]' : 'Start Race [Space]'}
        >
          {status === 'running' ? <Pause size={14} /> : <Play size={14} />}
          <span>{status === 'running' ? 'Pause' : status === 'finished' ? 'Restart' : 'Start'}</span>
          <kbd className="hidden sm:inline-block text-[9px] font-mono font-normal opacity-60 bg-black/20 px-1 rounded ml-0.5">
            Space
          </kbd>
        </button>

        {/* Step Forward (single tick) */}
        <button
          onClick={handleTick}
          disabled={status === 'running' || !canStart}
          className="p-1.5 rounded-lg text-glass-text/70 hover:text-white hover:bg-white/10 disabled:text-white/20 disabled:hover:bg-transparent transition-colors"
          title="Step forward one tick [→ or .]"
        >
          <StepForward size={16} />
        </button>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="p-1.5 rounded-lg text-glass-text/70 hover:text-white hover:bg-white/10 transition-colors"
          title="Reset Race [R]"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="hidden sm:block h-5 w-px bg-glass-border" />

      {/* Speed Controls: Slider + Multiplier Chips */}
      <div className="flex items-center gap-3">
        {/* Fine-grained slider */}
        <div className="flex items-center gap-1.5">
          <FastForward size={14} className="text-glass-text/60" />
          <input
            type="range"
            min={5}
            max={250}
            step={5}
            // Inverted so slider to right is faster (lower delay)
            value={255 - speed}
            onChange={(e) => setSpeed(255 - Number(e.target.value))}
            className="w-20 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-400"
            title={`${speed}ms delay per step`}
          />
          <span className="text-[10px] tabular-nums text-glass-text/60 w-9 text-right font-mono">
            {Math.round(1000 / Math.max(5, speed))} t/s
          </span>
        </div>

        {/* Quick Speed Chips */}
        <div className="flex items-center gap-1">
          {SPEED_PRESETS.map((preset) => {
            const isSelected = Math.abs(speed - preset.delay) <= 5;
            return (
              <button
                key={preset.label}
                onClick={() => {
                  setSpeed(preset.delay);
                  playClick();
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white/5 text-white/60 hover:bg-white/15 hover:text-white'
                }`}
                title={`Set speed to ${preset.label} (~${preset.delay}ms)`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
