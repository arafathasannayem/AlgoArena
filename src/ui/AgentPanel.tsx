/**
 * AgentPanel — Floating glass panel for managing race agents.
 *
 * Positioned on the left or top-left, allows users to:
 * - Select an algorithm from the registry with search trait indicators
 * - 1-Click Quick Match setup (A* vs BFS showdown)
 * - Add a new agent to the race
 * - View existing agents with their status and color
 * - Toggle individual agent visualization overlays
 * - Remove single agent or Clear All
 *
 * Sourced directly from the ALGORITHMS registry to keep colors/labels in sync.
 *
 * @module ui/AgentPanel
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PointerEvent } from 'react';
import { useAgentStore } from '../state/agentStore';
import { useGridStore } from '../state/gridStore';
import { ALGORITHMS } from '../algorithms';
import { playClick } from '../utils/sound';
import { UserPlus, Trash2, Eye, EyeOff, Bot, Swords, ChevronDown } from 'lucide-react';

const ALGO_TRAITS: Record<string, string> = {
  astar: 'Optimal Cost • Manhattan Heuristic',
  bfs: 'Fewest Steps • Unweighted',
  dijkstra: 'Cost-Optimal • Uniform Search',
  dfs: 'Deep Path • Non-Optimal',
  greedy: 'Greedy Heuristic • Fast Explorer',
  hillclimb: 'Local Ascent • Trap-Prone',
  annealing: 'Thermal Search • Escapes Traps',
};

/** Default fallback when a selected algorithm key has no registry color. */
const FALLBACK_COLOR = '#3b82f6';

/** Curated palette kept in sync with the algorithm registry colors. */
const PRESET_COLORS = [
  '#3b82f6', '#eab308', '#22c55e', '#a855f7', '#f97316', '#ef4444',
  '#14b8a6', '#ec4899', '#d946ef', '#22d3ee', '#6366f1', '#a3e635',
  '#f43f5e', '#facc15', '#ffffff',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  /** `md` shows swatch + hex + chevron; `sm` is a compact dot for list rows. */
  size?: 'md' | 'sm';
}

/** Clamp `n` into [0, 1]. */
function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/** Parse a hex color into HSV (invalid input falls back to white). */
function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const m = /^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.exec(hex.trim());
  if (!m) return { h: 0, s: 0, v: 1 };
  const f = m[1]!;
  const full =
    f.length === 3
      ? f.split('').map((c) => c + c).join('')
      : f;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * ((b - r) / delta + 2);
    else h = 60 * ((r - g) / delta + 4);
  }
  if (h < 0) h += 360;
  const s = max === 0 ? 0 : delta / max;
  return { h, s, v: max };
}

/** Convert HSV (h in degrees, s/v in [0,1]) to a #rrggbb string. */
function hsvToHex(hDeg: number, s: number, v: number): string {
  const h = ((hDeg % 360) + 360) % 360;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = v;
  let g = t;
  let b = p;
  switch (i % 6) {
    case 1:
      r = q; g = v; b = p;
      break;
    case 2:
      r = p; g = v; b = t;
      break;
    case 3:
      r = p; g = q; b = v;
      break;
    case 4:
      r = t; g = p; b = v;
      break;
    case 5:
      r = v; g = p; b = q;
      break;
  }
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Theme-consistent color picker: a glass dropdown with preset swatches, a
 * drag-to-pick saturation/value square, and a hue slider.
 */
function ColorPicker({ value, onChange, size = 'md' }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const anchorRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  // Current HSV, derived from the controlled value each render.
  const { h, s, v } = hexToHsv(value);

  // Close on outside click, scroll, or resize.
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const inside = anchorRef.current?.contains(target) || popRef.current?.contains(target);
      if (!inside) close();
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const openPicker = () => {
    const anchor = anchorRef.current;
    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      const popWidth = 240;
      const popHeight = 216;
      const gap = 8;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const spaceAbove = rect.top - gap;
      const opensUpward = spaceBelow < popHeight && spaceAbove > spaceBelow;
      const left = Math.max(gap, Math.min(rect.left, window.innerWidth - popWidth - gap));
      const top = opensUpward
        ? Math.max(gap, rect.top - popHeight - gap)
        : Math.min(rect.bottom + gap, window.innerHeight - popHeight - gap);
      setCoords({ left, top });
    }
    setOpen((o) => !o);
  };

  const handleSvPointer = (e: PointerEvent<HTMLDivElement>) => {
    const box = svRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const x = clamp01((e.clientX - rect.left) / rect.width);
    const y = clamp01((e.clientY - rect.top) / rect.height);
    onChange(hsvToHex(h, x, 1 - y));
  };

  const handleHuePointer = (e: PointerEvent<HTMLDivElement>) => {
    const bar = hueRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const x = clamp01((e.clientX - rect.left) / rect.width);
    onChange(hsvToHex(x * 360, s, v));
  };

  const popover = (
    <div className="w-60 p-2 bg-glass-bg backdrop-blur-md border border-glass-border rounded-panel shadow-2xl">
      <div className="flex flex-wrap gap-1.5">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              onChange(c);
              setOpen(false);
            }}
            className={`w-5 h-5 rounded-full border border-white/20 cursor-pointer transition-transform hover:scale-110 ${
              value.toLowerCase() === c ? 'ring-2 ring-blue-400' : ''
            }`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>

      {/* Saturation & brightness square */}
      <div
        ref={svRef}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          handleSvPointer(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) handleSvPointer(e);
        }}
        className="relative mt-2 h-24 w-full rounded-lg cursor-crosshair touch-none select-none"
        style={{
          backgroundImage: `linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, hsl(${h}, 100%, 50%))`,
        }}
        title="Saturation & brightness — click/drag"
      >
        <span
          className="pointer-events-none absolute w-3.5 h-3.5 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-white shadow-md"
          style={{ left: `${s * 100}%`, bottom: `${v * 100}%` }}
        />
      </div>

      {/* Hue slider */}
      <div
        ref={hueRef}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          handleHuePointer(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) handleHuePointer(e);
        }}
        className="relative mt-2 h-3.5 w-full rounded-full cursor-ew-resize touch-none select-none"
        style={{
          background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
        }}
        title="Hue — drag"
      >
        <span
          className="pointer-events-none absolute top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
          style={{ left: `${(h / 360) * 100}%` }}
        />
      </div>

      {/* Live preview */}
      <div className="mt-2 flex items-center gap-2 pt-2 border-t border-glass-border">
        <span
          className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
          style={{ backgroundColor: value }}
        />
        <span className="font-mono text-[10px] text-white/60">{value.toUpperCase()}</span>
        <span className="ml-auto text-[9px] uppercase tracking-wider text-white/30 font-semibold">
          Live
        </span>
      </div>
    </div>
  );

  const trigger =
    size === 'sm' ? (
      <button
        ref={anchorRef}
        type="button"
        onClick={openPicker}
        className="w-3.5 h-3.5 shrink-0 rounded-full border border-white/20 shadow-sm cursor-pointer hover:scale-110 transition-transform"
        title="Change this agent's color"
        style={{ backgroundColor: value }}
      />
    ) : (
      <button
        ref={anchorRef}
        type="button"
        onClick={openPicker}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs cursor-pointer transition-colors"
        title="Choose a custom pawn color"
      >
        <span
          className="w-4 h-4 rounded-md border border-white/20 shadow-sm shrink-0"
          style={{ backgroundColor: value }}
        />
        <span className="font-mono text-[10px] text-white/60">{value}</span>
        <ChevronDown size={11} className="text-white/40" />
      </button>
    );

  return (
    <>
      {trigger}
      {open &&
        createPortal(
          <div
            ref={popRef}
            className="fixed z-50"
            style={{ left: coords.left, top: coords.top }}
          >
            {popover}
          </div>,
          document.body,
        )}
    </>
  );
}

export function AgentPanel() {
  const agents = useAgentStore((s) => s.agents);
  const addAgent = useAgentStore((s) => s.addAgent);
  const removeAgent = useAgentStore((s) => s.removeAgent);
  const toggleOverlay = useAgentStore((s) => s.toggleOverlay);
  const setColor = useAgentStore((s) => s.setColor);
  const start = useGridStore((s) => s.start);

  // Default to first implemented algorithm
  const [selectedKey, setSelectedKey] = useState<string>('astar');
  const [selectedColor, setSelectedColor] = useState<string>(
  ALGORITHMS.astar?.color ?? FALLBACK_COLOR,
);

  const handleSelectAlgorithm = (key: string) => {
    setSelectedKey(key);
    setSelectedColor(ALGORITHMS[key]?.color ?? FALLBACK_COLOR);
  };

  const handleAddAgent = () => {
    const entry = ALGORITHMS[selectedKey];
    if (!entry) return;
    addAgent(selectedKey, selectedColor, start);
    playClick();
  };

  const handleQuickMatch = () => {
    // Clear existing and add A* and BFS for instant race
    agents.forEach((a) => removeAgent(a.id));
    if (ALGORITHMS.astar) {
      addAgent('astar', ALGORITHMS.astar.color, start);
    }
    if (ALGORITHMS.bfs) {
      addAgent('bfs', ALGORITHMS.bfs.color, start);
    }
    playClick();
  };

  const handleClearAll = () => {
    agents.forEach((a) => removeAgent(a.id));
    playClick();
  };

  return (
    <div className="fixed top-4 left-4 bg-glass-bg backdrop-blur-md border border-glass-border rounded-panel p-3 flex flex-col gap-2.5 z-10 w-64 text-glass-text max-h-[calc(100vh-2rem)] overflow-y-auto shadow-xl">
      <div className="flex items-center justify-between pb-1 border-b border-glass-border">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-blue-400" />
          <span className="text-sm font-semibold tracking-wide">Agents ({agents.length})</span>
        </div>
        {agents.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-[10px] text-red-400/80 hover:text-red-300 font-medium px-1.5 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors"
            title="Clear all placed agents"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Quick 1-Click Match Preset */}
      <button
        onClick={handleQuickMatch}
        className="flex items-center justify-center gap-2 w-full py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-colors"
        title="Set up A* vs BFS match"
      >
        <Swords size={13} className="text-blue-400" />
        <span>Quick Match: A* vs BFS</span>
      </button>

      {/* Add Agent Form */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] uppercase tracking-wider text-glass-text/60 font-semibold">
          Select Algorithm
        </label>
        <div className="flex gap-2">
          <select
            value={selectedKey}
            onChange={(e) => handleSelectAlgorithm(e.target.value)}
            className="flex-1 bg-white/10 border border-glass-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {Object.entries(ALGORITHMS).map(([key, item]) => (
              <option key={key} value={key} className="bg-slate-900 text-white">
                {item.label} {!item.implemented ? '(TODO)' : ''}
              </option>
            ))}
          </select>

          <button
            onClick={handleAddAgent}
            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors flex items-center justify-center shrink-0 shadow-sm"
            title="Add Agent to Grid"
          >
            <UserPlus size={16} />
          </button>
        </div>

        {/* Color selector */}
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] uppercase tracking-wider text-glass-text/60 font-semibold">
            Pawn Color
          </label>
          <ColorPicker value={selectedColor} onChange={setSelectedColor} />
        </div>

        {/* Algorithm Characteristic Badge */}
        {ALGO_TRAITS[selectedKey] && (
          <div className="text-[10px] text-white/50 bg-white/5 border border-white/5 rounded px-2 py-1 leading-tight">
            {ALGO_TRAITS[selectedKey]}
          </div>
        )}
      </div>

      {/* Agent List */}
      {agents.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1 border-t border-glass-border">
          <span className="text-[10px] uppercase tracking-wider text-glass-text/40 font-semibold">
            Placed Agents
          </span>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {agents.map((agent) => {
              const meta = ALGORITHMS[agent.algorithmKey];
              const label = meta ? meta.label : agent.algorithmKey;

              return (
                <div
                  key={agent.id}
                  className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white/5 border border-white/10 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ColorPicker
                      value={agent.color}
                      onChange={(c) => {
                        setColor(agent.id, c);
                        playClick();
                      }}
                      size="sm"
                    />
                    <span className="truncate font-medium">{label}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        toggleOverlay(agent.id);
                        playClick();
                      }}
                      className={`p-1 rounded transition-colors ${
                        agent.showOverlay
                          ? 'text-blue-400 hover:bg-white/10'
                          : 'text-white/30 hover:bg-white/10'
                      }`}
                      title={agent.showOverlay ? 'Hide Overlay' : 'Show Overlay'}
                    >
                      {agent.showOverlay ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      onClick={() => {
                        removeAgent(agent.id);
                        playClick();
                      }}
                      className="p-1 rounded text-red-400/70 hover:text-red-400 hover:bg-white/10 transition-colors"
                      title="Remove Agent"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
