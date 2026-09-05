/**
 * ToolPalette — Floating glass panel with editing tools and presets.
 *
 * Positioned at the left edge of the viewport. Contains:
 * - Wall / Eraser / Start / Goal tool buttons
 * - Clear Grid button
 * - Map preset buttons
 *
 * @module ui/ToolPalette
 */

import { useState, useRef } from 'react';
import { useGridStore, type Tool } from '../state/gridStore';
import { useRaceStore } from '../state/raceStore';
import { useSoundStore } from '../state/soundStore';
import { playClick, playPlace } from '../utils/sound';
import {
  Square,
  Eraser,
  Flag,
  Target,
  Trash2,
  Map,
  Mountain,
  GripVertical,
  RotateCcw,
  Volume2,
  VolumeX,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { PRESETS } from '../maps/presets';

interface ToolDef {
  id: Tool;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}

const TOOLS: ToolDef[] = [
  { id: 'wall', label: 'Wall', shortcut: 'W', icon: <Square size={16} /> },
  { id: 'cost', label: 'High Cost', shortcut: 'C', icon: <Mountain size={16} /> },
  { id: 'eraser', label: 'Eraser', shortcut: 'E', icon: <Eraser size={16} /> },
  { id: 'start', label: 'Start Point', shortcut: 'S', icon: <Flag size={16} /> },
  { id: 'goal', label: 'Goal Point', shortcut: 'G', icon: <Target size={16} /> },
];

interface ToolPaletteProps {
  onOpenHelp?: () => void;
}

// Persist user-dragged position across run/pause/finish cycles
let savedPos = { x: 16, y: 140 };

export function ToolPalette({ onOpenHelp }: ToolPaletteProps = {}) {
  const isRunning = useRaceStore((s) => s.status === 'running');
  const activeTool = useGridStore((s) => s.activeTool);
  const setActiveTool = useGridStore((s) => s.setActiveTool);
  const highCostValue = useGridStore((s) => s.highCostValue);
  const setHighCostValue = useGridStore((s) => s.setHighCostValue);
  const showCostLabels = useGridStore((s) => s.showCostLabels);
  const toggleCostLabels = useGridStore((s) => s.toggleCostLabels);
  const clearGrid = useGridStore((s) => s.clearGrid);
  const loadPreset = useGridStore((s) => s.loadPreset);

  const soundEnabled = useSoundStore((s) => s.enabled);
  const toggleSound = useSoundStore((s) => s.toggleSound);

  // Dragging / Moveable window state
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number }>(savedPos);
  const isDragging = useRef(false);
  const dragStart = useRef({ startX: 0, startY: 0, posX: savedPos.x, posY: savedPos.y });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    dragStart.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: pos.x,
      posY: pos.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.startX;
    const dy = e.clientY - dragStart.current.startY;
    const panelWidth = panelRef.current?.offsetWidth ?? 170;
    const panelHeight = panelRef.current?.offsetHeight ?? 420;
    const nextX = Math.max(8, Math.min(window.innerWidth - panelWidth - 8, dragStart.current.posX + dx));
    const nextY = Math.max(8, Math.min(window.innerHeight - panelHeight - 8, dragStart.current.posY + dy));
    const nextPos = { x: nextX, y: nextY };
    savedPos = nextPos;
    setPos(nextPos);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already released
    }
  };

  if (isRunning) return null;

  return (
    <div
      ref={panelRef}
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      className="fixed bg-glass-bg backdrop-blur-md border border-glass-border rounded-panel p-2.5 flex flex-col gap-1.5 z-10 w-48 shadow-2xl transition-shadow animate-in fade-in duration-150"
    >
      {/* Draggable Window Header */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex items-center justify-between px-1 py-1 cursor-grab active:cursor-grabbing select-none text-white/50 hover:text-white/80 transition-colors border-b border-white/10 mb-0.5"
        title="Click and drag to move toolbox"
      >
        <div className="flex items-center gap-1.5">
          <GripVertical size={13} className="text-white/40" />
          <span className="text-[10px] font-semibold tracking-wider uppercase text-white/70">
            Toolbox
          </span>
        </div>

        <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
          {/* Sound Toggle */}
          <button
            onClick={() => {
              toggleSound();
              playClick();
            }}
            className={`p-1 rounded transition-colors ${
              soundEnabled
                ? 'text-amber-300 hover:text-amber-200 hover:bg-white/10'
                : 'text-white/30 hover:text-white/60 hover:bg-white/10'
            }`}
            title={soundEnabled ? 'Audio FX Enabled (Click to Mute)' : 'Audio FX Muted (Click to Unmute)'}
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>

          {/* Toggle Cost Text on Tiles */}
          <button
            onClick={() => {
              toggleCostLabels();
              playClick();
            }}
            className={`p-1 rounded transition-colors ${
              showCostLabels
                ? 'text-amber-400 hover:text-amber-300 hover:bg-white/10'
                : 'text-white/30 hover:text-white/60 hover:bg-white/10'
            }`}
            title={showCostLabels ? 'Tile Cost Numbers: ON (Click to Hide)' : 'Tile Cost Numbers: OFF (Click to Show)'}
          >
            {showCostLabels ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>

          {/* Guide / Manual Button */}
          {onOpenHelp && (
            <button
              onClick={() => {
                onOpenHelp();
                playClick();
              }}
              className="p-1 rounded text-blue-300 hover:text-blue-200 hover:bg-white/10 transition-colors"
              title="Game Manual & Hotkeys [?]"
            >
              <HelpCircle size={13} />
            </button>
          )}

          {/* Reset position */}
          <button
            onClick={() => {
              savedPos = { x: 16, y: 140 };
              setPos(savedPos);
              playClick();
            }}
            className="text-[9px] text-white/40 hover:text-white/80 p-1 rounded transition-colors"
            title="Reset position"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Tool buttons */}
      {TOOLS.map((t) => {
        const isActive = activeTool === t.id;
        return (
          <div key={t.id} className="flex flex-col gap-1">
            <button
              onClick={() => {
                setActiveTool(t.id);
                playClick();
              }}
              className={`p-2 rounded-lg transition-colors flex items-center justify-between w-full ${
                isActive
                  ? t.id === 'cost'
                    ? 'bg-amber-500/25 border border-amber-500/40 text-amber-300 shadow-sm'
                    : 'bg-white/20 text-white shadow-sm'
                  : 'text-glass-text/60 hover:text-white hover:bg-white/10'
              }`}
              title={`${t.label} [${t.shortcut}]`}
            >
              <div className="flex items-center gap-2">
                {t.icon}
                <span className="text-xs font-medium">{t.label}</span>
              </div>
              <div className="flex items-center gap-1">
                {t.id === 'cost' && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    ×{highCostValue}
                  </span>
                )}
                <kbd className="text-[9px] font-mono font-semibold px-1 py-0.5 rounded bg-white/10 text-white/50">
                  {t.shortcut}
                </kbd>
              </div>
            </button>

            {/* High Cost Value Settings (when cost tool is selected) */}
            {t.id === 'cost' && isActive && (
              <div className="bg-slate-900/60 border border-amber-500/30 rounded-lg p-2 flex flex-col gap-1.5 my-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-amber-300/90">
                    Cost Multiplier
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setHighCostValue(Math.max(2, highCostValue - 1));
                        playClick();
                      }}
                      className="w-4 h-4 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                      title="Decrease cost"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={2}
                      max={99}
                      value={highCostValue}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v)) setHighCostValue(v);
                      }}
                      className="w-8 bg-slate-950/80 border border-amber-500/40 rounded text-center text-xs font-mono font-bold text-amber-300 py-0.5 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={() => {
                        setHighCostValue(Math.min(99, highCostValue + 1));
                        playClick();
                      }}
                      className="w-4 h-4 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                      title="Increase cost"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Quick preset chips */}
                <div className="flex items-center justify-between gap-1 pt-0.5">
                  {[2, 5, 10, 20].map((presetVal) => (
                    <button
                      key={presetVal}
                      onClick={() => {
                        setHighCostValue(presetVal);
                        playClick();
                      }}
                      className={`flex-1 py-0.5 text-[9px] font-mono font-bold rounded transition-colors ${
                        highCostValue === presetVal
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-white/5 text-amber-200/70 hover:bg-white/15 hover:text-white'
                      }`}
                      title={`Set cost to ${presetVal}`}
                    >
                      {presetVal}
                    </button>
                  ))}
                </div>

                {/* Toggle Cost Number on Tiles */}
                <div className="flex items-center justify-between pt-1 border-t border-amber-500/20">
                  <span className="text-[10px] font-medium text-amber-300/80">
                    Tile Cost Numbers
                  </span>
                  <button
                    onClick={() => {
                      toggleCostLabels();
                      playClick();
                    }}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      showCostLabels
                        ? 'bg-amber-500/25 text-amber-200 hover:bg-amber-500/35 border border-amber-500/40'
                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                    }`}
                    title="Toggle softly displaying cost value on the tile design"
                  >
                    {showCostLabels ? <Eye size={11} /> : <EyeOff size={11} />}
                    <span>{showCostLabels ? 'Visible' : 'Hidden'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="border-t border-glass-border my-1" />

      {/* Clear button */}
      <button
        onClick={() => {
          clearGrid();
          playClick();
        }}
        className="p-2 rounded-lg text-red-400/80 hover:text-red-400 hover:bg-white/10 transition-colors flex items-center gap-2 w-full"
        title="Clear Grid (removes all walls and high-cost tiles)"
      >
        <Trash2 size={16} />
        <span className="text-xs font-medium">Clear Grid</span>
      </button>

      <div className="border-t border-glass-border my-1" />

      {/* Map presets */}
      <div className="px-1 py-0.5">
        <span className="text-[9px] uppercase tracking-wider text-glass-text/40 font-semibold">
          Map Presets
        </span>
      </div>
      {Object.entries(PRESETS).map(([key, preset]) => (
        <button
          key={key}
          onClick={() => {
            loadPreset(preset.walls, preset.start, preset.goal, preset.width, preset.height);
            playPlace();
          }}
          className="p-1.5 rounded-lg text-glass-text/60 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 text-left w-full"
          title={preset.description}
        >
          <Map size={13} />
          <span className="text-xs truncate">{preset.name}</span>
        </button>
      ))}
    </div>
  );
}
