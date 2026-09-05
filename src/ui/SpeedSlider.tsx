/**
 * SpeedSlider — Floating glass panel for race playback and speed controls.
 *
 * Provides:
 * - Start / Pause / Resume / Reset buttons
 * - Live speed slider (adjustable mid-race without interruption)
 * - Single-step tick button for debugging
 * - Start button validation (disabled when no agents placed)
 *
 * @module ui/SpeedSlider
 */

import { useRaceStore } from '../state/raceStore';
import { useAgentStore } from '../state/agentStore';
import { Play, Pause, RotateCcw, FastForward, StepForward } from 'lucide-react';

export function SpeedSlider() {
  const status = useRaceStore((s) => s.status);
  const speed = useRaceStore((s) => s.speed);
  const setSpeed = useRaceStore((s) => s.setSpeed);
  const startRace = useRaceStore((s) => s.startRace);
  const pauseRace = useRaceStore((s) => s.pauseRace);
  const resetRace = useRaceStore((s) => s.resetRace);
  const tick = useRaceStore((s) => s.tick);

  const agentsCount = useAgentStore((s) => s.agents.length);
  const canStart = agentsCount > 0;

  const handlePlayToggle = () => {
    if (status === 'running') {
      pauseRace();
    } else if (status === 'finished') {
      startRace();
    } else {
      // Idle: if agents were already mid-race, resume; otherwise start
      startRace();
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-glass-bg backdrop-blur-md border border-glass-border rounded-panel px-4 py-2.5 flex items-center gap-4 z-10 text-glass-text shadow-xl">
      {/* Play/Pause Button */}
      <button
        onClick={handlePlayToggle}
        disabled={!canStart}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium text-xs transition-all ${
          !canStart
            ? 'bg-white/5 text-white/30 cursor-not-allowed'
            : status === 'running'
            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
        }`}
        title={!canStart ? 'Add at least one agent first' : status === 'running' ? 'Pause Race' : 'Start Race'}
      >
        {status === 'running' ? <Pause size={15} /> : <Play size={15} />}
        <span>{status === 'running' ? 'Pause' : status === 'finished' ? 'Restart' : 'Start Race'}</span>
      </button>

      {/* Step Forward (single tick) */}
      <button
        onClick={tick}
        disabled={status === 'running' || !canStart}
        className="p-1.5 rounded-lg text-glass-text/70 hover:text-white hover:bg-white/10 disabled:text-white/20 disabled:hover:bg-transparent transition-colors"
        title="Step forward one tick"
      >
        <StepForward size={16} />
      </button>

      {/* Reset */}
      <button
        onClick={resetRace}
        className="p-1.5 rounded-lg text-glass-text/70 hover:text-white hover:bg-white/10 transition-colors"
        title="Reset Race"
      >
        <RotateCcw size={16} />
      </button>

      <div className="h-5 w-px bg-glass-border" />

      {/* Speed Slider */}
      <div className="flex items-center gap-2">
        <FastForward size={15} className="text-glass-text/60" />
        <span className="text-[11px] text-glass-text/60 font-medium">Speed:</span>
        <input
          type="range"
          min={5}
          max={250}
          step={5}
          // Inverted so slider to right is faster (lower delay)
          value={255 - speed}
          onChange={(e) => setSpeed(255 - Number(e.target.value))}
          className="w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-400"
          title={`${speed}ms delay per step`}
        />
        <span className="text-[10px] tabular-nums text-glass-text/50 w-8">
          {Math.round(1000 / Math.max(5, speed))} t/s
        </span>
      </div>
    </div>
  );
}
