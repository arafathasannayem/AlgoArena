/**
 * BottomConsole — Docked dual-mode tactical bottom console.
 *
 * Auto-switches between:
 * 1. Editing Mode (when idle): Compact tool ribbon (Wall, Cost, Eraser, Start, Goal),
 *    cost stepper, clear grid, map presets, save arena, and Start Race button.
 * 2. Playback Mode (when running / paused mid-race): Play/Pause, Step, Reset,
 *    and speed multiplier chips.
 *
 * @module ui/BottomConsole
 */

import { useGridStore, type Tool } from '../state/gridStore';
import { useRaceStore } from '../state/raceStore';
import { useAgentStore } from '../state/agentStore';
import { useGameMenuStore } from '../state/gameMenuStore';
import { playClick, playStartFanfare, playStepTick } from '../utils/sound';
import {
  Square,
  Mountain,
  Eraser,
  Flag,
  Target,
  Trash2,
  Map,
  Save,
  Play,
  Pause,
  RotateCcw,
  StepForward,
  FastForward,
} from 'lucide-react';

interface ToolDef {
  id: Tool;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}

const TOOLS: ToolDef[] = [
  { id: 'wall', label: 'Wall', shortcut: 'W', icon: <Square size={14} /> },
  { id: 'cost', label: 'Rough', shortcut: 'C', icon: <Mountain size={14} /> },
  { id: 'eraser', label: 'Eraser', shortcut: 'E', icon: <Eraser size={14} /> },
  { id: 'start', label: 'Start', shortcut: 'S', icon: <Flag size={14} /> },
  { id: 'goal', label: 'Goal', shortcut: 'G', icon: <Target size={14} /> },
];

const SPEED_PRESETS = [
  { label: '0.5x', delay: 150 },
  { label: '1x', delay: 50 },
  { label: '2x', delay: 25 },
  { label: '5x', delay: 10 },
  { label: 'MAX', delay: 5 },
] as const;

const COST_PRESETS = [2, 3, 5, 10, 25];

export function BottomConsole() {
  const activeTool = useGridStore((s) => s.activeTool);
  const setActiveTool = useGridStore((s) => s.setActiveTool);
  const highCostValue = useGridStore((s) => s.highCostValue);
  const setHighCostValue = useGridStore((s) => s.setHighCostValue);
  const goalsCount = useGridStore((s) => s.goals.length);
  const clearGrid = useGridStore((s) => s.clearGrid);

  const openPresetChooser = useGameMenuStore((s) => s.openPresetChooser);
  const openSavePreset = useGameMenuStore((s) => s.openSavePreset);

  const raceStatus = useRaceStore((s) => s.status);
  const speed = useRaceStore((s) => s.speed);
  const setSpeed = useRaceStore((s) => s.setSpeed);
  const startRace = useRaceStore((s) => s.startRace);
  const pauseRace = useRaceStore((s) => s.pauseRace);
  const resetRace = useRaceStore((s) => s.resetRace);
  const tick = useRaceStore((s) => s.tick);

  const agentsCount = useAgentStore((s) => s.agents.length);
  const canStart = agentsCount > 0;

  const isRunning = raceStatus === 'running';
  const anyExplored = useAgentStore((s) => s.agents.some((a) => a.visitedNodes.size > 1));
  const isMidRace = isRunning || (raceStatus === 'idle' && anyExplored);

  const handlePlayToggle = () => {
    if (isRunning) {
      pauseRace();
      playClick();
    } else {
      if (!canStart) return;
      startRace();
      playStartFanfare();
    }
  };

  return (
    <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto select-none">
      <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 flex items-center gap-2.5 shadow-2xl text-slate-200">
        {isMidRace ? (
          /* ── Playback Controls (Mid-Race or Paused Mid-Race) ── */
          <>
            {/* Status Indicator */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono font-bold tracking-wider">
              <span
                className={`w-2 h-2 rounded-full ${
                  isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-white/80">{isRunning ? 'RACING' : 'PAUSED'}</span>
            </div>

            {/* Play / Pause */}
            <button
              onClick={handlePlayToggle}
              className={`p-2 rounded-xl text-white font-bold transition-transform active:scale-95 shadow-md flex items-center gap-1.5 ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
              title={isRunning ? 'Pause [Space]' : 'Resume [Space]'}
            >
              {isRunning ? <Pause size={15} /> : <Play size={15} />}
              <span className="text-xs">{isRunning ? 'Pause' : 'Resume'}</span>
            </button>

            {/* Step 1 Tick */}
            <button
              onClick={() => {
                if (!isRunning) {
                  tick();
                  playStepTick();
                }
              }}
              disabled={isRunning}
              className={`p-2 rounded-xl border transition-colors flex items-center gap-1 ${
                isRunning
                  ? 'opacity-30 border-transparent text-slate-500 cursor-not-allowed'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
              }`}
              title="Advance 1 Step [→]"
            >
              <StepForward size={14} />
              <span className="text-xs">Step</span>
            </button>

            {/* Reset */}
            <button
              onClick={() => {
                resetRace();
                playClick();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
              title="Reset Race [R]"
            >
              <RotateCcw size={14} />
              <span className="text-xs">Reset</span>
            </button>

            <span className="w-px h-5 bg-white/10 mx-1" />

            {/* Speed Multipliers */}
            <div className="flex items-center gap-1">
              <FastForward size={13} className="text-slate-500 mr-1" />
              {SPEED_PRESETS.map((preset) => {
                const isActive = Math.abs(speed - preset.delay) <= 2;
                return (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setSpeed(preset.delay);
                      playClick();
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          /* ── Editing & Map Building Controls (Idle / Standby) ── */
          <>
            {/* Tool Palette Chips */}
            <div className="flex items-center gap-1">
              {TOOLS.map((t) => {
                const isActive = activeTool === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTool(t.id);
                      playClick();
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? t.id === 'cost'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'bg-white/20 text-white border border-white/25 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
                    }`}
                    title={`${t.label} Tool [${t.shortcut}]`}
                  >
                    {t.icon}
                    <span>{t.label}</span>

                    {t.id === 'cost' && (
                      <span className="text-[9px] font-mono font-bold px-1 rounded bg-amber-400/20 text-amber-300">
                        ×{highCostValue}
                      </span>
                    )}
                    {t.id === 'goal' && goalsCount > 1 && (
                      <span className="text-[9px] font-mono font-bold px-1 rounded bg-amber-400/20 text-amber-300">
                        ×{goalsCount}
                      </span>
                    )}

                    <kbd className="text-[9px] font-mono opacity-50 ml-0.5">
                      {t.shortcut}
                    </kbd>
                  </button>
                );
              })}
            </div>

            {/* Inline Cost Multiplier Selector (when Rough Cost tool is selected) */}
            {activeTool === 'cost' && (
              <div className="flex items-center gap-1 pl-1.5 border-l border-amber-500/30">
                {COST_PRESETS.map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      setHighCostValue(val);
                      playClick();
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                      highCostValue === val
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-amber-400/70 hover:text-amber-300 hover:bg-white/10'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            )}

            <span className="w-px h-5 bg-white/10 mx-0.5" />

            {/* Utility Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  clearGrid();
                  playClick();
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
                title="Clear all walls and costs"
              >
                <Trash2 size={14} />
              </button>

              <button
                onClick={() => {
                  openPresetChooser();
                  playClick();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Browse Map Presets [P]"
              >
                <Map size={13} className="text-blue-400" />
                <span>Maps</span>
                <kbd className="text-[9px] font-mono opacity-50">P</kbd>
              </button>

              <button
                onClick={() => {
                  openSavePreset();
                  playClick();
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Save Map Layout"
              >
                <Save size={14} />
              </button>
            </div>

            <span className="w-px h-5 bg-white/10 mx-0.5" />

            {/* Primary Action: Start Race */}
            <button
              onClick={handlePlayToggle}
              disabled={!canStart}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-md ${
                canStart
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                  : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
              }`}
              title={canStart ? 'Start Race [Space]' : 'Add racers to start line first'}
            >
              <Play size={13} />
              <span>Start Race</span>
              <kbd className="text-[9px] font-mono opacity-60 bg-black/20 px-1 rounded">
                Space
              </kbd>
            </button>
          </>
        )}
      </div>
    </footer>
  );
}
