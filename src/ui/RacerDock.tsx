/**
 * RacerDock — Unified indie game racer roster and live standings dock.
 *
 * Consolidates AgentPanel and Leaderboard into a single, compact, collapsible left sidebar:
 * - Pre-race: Add/remove agents, color swatch picker, 1-click Quick Match (A* vs BFS)
 * - In-race / Finished: Automatically displays live ranked standings sorted by goal proximity/cost
 * - Collapsible toggle button (◀ / ▶) to maximize diorama viewing space
 *
 * @module ui/RacerDock
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import type { PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { useAgentStore, type Agent } from '../state/agentStore';
import { useGridStore } from '../state/gridStore';
import { useRaceStore } from '../state/raceStore';
import { ALGORITHMS, getImplementedAlgorithms } from '../algorithms';
import { playClick } from '../utils/sound';
import {
  Bot,
  UserPlus,
  Trash2,
  Eye,
  EyeOff,
  Swords,
  ChevronDown,
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#eab308', // yellow
  '#22c55e', // green
  '#a855f7', // purple
  '#f97316', // orange
  '#ef4444', // red
  '#14b8a6', // teal
  '#ec4899', // pink
  '#d946ef', // fuchsia
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f43f5e', // rose
] as const;

const FALLBACK_COLOR = '#3b82f6';

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean.padEnd(6, '0').slice(0, 6);
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255);
  const max = Math.max(r!, g!, b!);
  const min = Math.min(r!, g!, b!);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g! - b!) / d) % 6;
    else if (max === g) h = (b! - r!) / d + 2;
    else h = (r! - g!) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h, s, v };
}

function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  const seg = Math.floor(hp);
  if (seg === 0) { r = c; g = x; }
  else if (seg === 1) { r = x; g = c; }
  else if (seg === 2) { g = c; b = x; }
  else if (seg === 3) { g = x; b = c; }
  else if (seg === 4) { r = x; b = c; }
  else { r = c; b = x; }
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  size?: 'sm' | 'md';
}

function ColorPicker({ value, onChange, size = 'md' }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const anchorRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  const { h, s, v } = hexToHsv(value);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const inside = anchorRef.current?.contains(target) || popRef.current?.contains(target);
      if (!inside) close();
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const openPicker = () => {
    const anchor = anchorRef.current;
    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      const popWidth = 220;
      const popHeight = 200;
      const gap = 6;
      const left = Math.max(gap, Math.min(rect.right + gap, window.innerWidth - popWidth - gap));
      const top = Math.max(gap, Math.min(rect.top, window.innerHeight - popHeight - gap));
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
    <div className="w-56 p-2.5 bg-slate-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl flex flex-col gap-2 select-none">
      <div className="flex flex-wrap gap-1">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              onChange(c);
              setOpen(false);
            }}
            className={`w-4.5 h-4.5 rounded-full border border-white/20 transition-transform hover:scale-110 ${
              value.toLowerCase() === c ? 'ring-2 ring-amber-400' : ''
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div
        ref={svRef}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          handleSvPointer(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) handleSvPointer(e);
        }}
        className="relative h-24 w-full rounded-lg cursor-crosshair overflow-hidden border border-white/10"
        style={{
          backgroundColor: `hsl(${h}, 100%, 50%)`,
          backgroundImage:
            'linear-gradient(to right, #fff, transparent), linear-gradient(to top, #000, transparent)',
        }}
      >
        <div
          className="absolute w-3 h-3 rounded-full border border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${s * 100}%`,
            top: `${(1 - v) * 100}%`,
            backgroundColor: value,
          }}
        />
      </div>

      <div
        ref={hueRef}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          handleHuePointer(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) handleHuePointer(e);
        }}
        className="relative h-3 w-full rounded-full cursor-pointer border border-white/10"
        style={{
          background:
            'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
        }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-white bg-white pointer-events-none shadow"
          style={{ left: `${(h / 360) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={openPicker}
        className={`rounded-full border border-white/30 shadow-inner cursor-pointer shrink-0 transition-transform hover:scale-105 ${
          size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
        }`}
        style={{ backgroundColor: value }}
        title="Change pawn team color"
      />
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popRef}
            style={{ position: 'fixed', left: coords.left, top: coords.top, zIndex: 9999 }}
          >
            {popover}
          </div>,
          document.body,
        )}
    </>
  );
}

function getAgentPathCost(agent: Agent, costs: Map<string, number>): number {
  if (agent.result?.cost !== undefined) return agent.result.cost;
  if (!agent.result?.path || agent.result.path.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < agent.result.path.length; i++) {
    sum += costs.get(`${agent.result.path[i]!.x},${agent.result.path[i]!.y}`) ?? 1;
  }
  return sum;
}

export function RacerDock() {
  const [collapsed, setCollapsed] = useState(false);

  const agents = useAgentStore((s) => s.agents);
  const addAgent = useAgentStore((s) => s.addAgent);
  const removeAgent = useAgentStore((s) => s.removeAgent);
  const toggleOverlay = useAgentStore((s) => s.toggleOverlay);
  const setColor = useAgentStore((s) => s.setColor);

  const start = useGridStore((s) => s.start);
  const goals = useGridStore((s) => s.goals);
  const costs = useGridStore((s) => s.costs);

  const raceStatus = useRaceStore((s) => s.status);
  const isRacing = raceStatus === 'running';

  const [selectedKey, setSelectedKey] = useState<string>('astar');
  const [selectedColor, setSelectedColor] = useState<string>(
    ALGORITHMS.astar?.color ?? FALLBACK_COLOR,
  );

  const implemented = useMemo(() => getImplementedAlgorithms(), []);

  const handleSelectAlgorithm = (key: string) => {
    setSelectedKey(key);
    setSelectedColor(ALGORITHMS[key]?.color ?? FALLBACK_COLOR);
  };

  const handleAddAgent = () => {
    addAgent(selectedKey, selectedColor, start);
    playClick();
  };

  const handleQuickMatch = () => {
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

  // Distance to the closest goal (Manhattan)
  const distToNearestGoal = useMemo(() => {
    return (p: { x: number; y: number }) =>
      Math.min(...goals.map((g) => Math.abs(p.x - g.x) + Math.abs(p.y - g.y)));
  }, [goals]);

  // Ranked order for active race or results
  const ranked = useMemo(() => {
    return [...agents].sort((a, b) => {
      const aDone = a.result?.status === 'success';
      const bDone = b.result?.status === 'success';
      if (aDone && !bDone) return -1;
      if (!aDone && bDone) return 1;

      if (aDone && bDone) {
        const aCost = getAgentPathCost(a, costs);
        const bCost = getAgentPathCost(b, costs);
        if (aCost !== bCost) return aCost - bCost;
        const aLen = a.result?.path?.length ?? Infinity;
        const bLen = b.result?.path?.length ?? Infinity;
        if (aLen !== bLen) return aLen - bLen;
        return (a.result?.timeMs ?? 0) - (b.result?.timeMs ?? 0);
      }

      const distA = distToNearestGoal(a.position);
      const distB = distToNearestGoal(b.position);
      if (distA !== distB) return distA - distB;

      return a.visitedNodes.size - b.visitedNodes.size;
    });
  }, [agents, distToNearestGoal, costs]);

  // Show live standings mode when race is running or finished with results
  const showStandingsMode = isRacing || agents.some((a) => a.result !== undefined);

  if (collapsed) {
    return (
      <div className="fixed left-3 top-16 z-20 pointer-events-auto">
        <button
          onClick={() => {
            setCollapsed(false);
            playClick();
          }}
          className="bg-slate-900/90 backdrop-blur-md border border-white/15 rounded-xl p-2.5 text-slate-300 hover:text-white hover:bg-white/10 shadow-2xl flex items-center gap-2 transition-all active:scale-95"
          title="Expand Racers Dock"
        >
          <Bot size={16} className="text-amber-400" />
          <span className="font-mono text-xs font-bold">{agents.length}</span>
          <ChevronRight size={14} className="opacity-60" />
        </button>
      </div>
    );
  }

  return (
    <aside className="fixed left-3 top-16 bottom-20 z-20 pointer-events-auto w-72 flex flex-col bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl text-slate-200 select-none overflow-hidden transition-all animate-in fade-in duration-150">
      {/* Dock Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          {showStandingsMode ? (
            <Trophy size={16} className="text-amber-400" />
          ) : (
            <Bot size={16} className="text-blue-400" />
          )}
          <span className="text-xs font-bold tracking-wider uppercase font-sans">
            {showStandingsMode ? 'Live Standings' : `Racers (${agents.length})`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {agents.length > 0 && !isRacing && (
            <button
              onClick={handleClearAll}
              className="text-[10px] text-red-400/80 hover:text-red-300 px-1.5 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 font-medium transition-colors"
              title="Clear all placed agents"
            >
              Clear
            </button>
          )}

          {/* Collapse Button */}
          <button
            onClick={() => {
              setCollapsed(true);
              playClick();
            }}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={14} />
          </button>
        </div>
      </div>

      {/* Pre-Race Controls (Hidden when race is actively running) */}
      {!showStandingsMode && (
        <div className="flex flex-col gap-2 pt-2 pb-1">
          {/* Quick Match 1-Click Button */}
          <button
            onClick={handleQuickMatch}
            className="flex items-center justify-center gap-2 w-full py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-colors"
            title="Instant A* vs BFS match"
          >
            <Swords size={13} className="text-amber-400" />
            <span>Quick Match: A* vs BFS</span>
          </button>

          {/* Add Agent Form */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-white/10 rounded-xl p-1.5">
            <ColorPicker value={selectedColor} onChange={setSelectedColor} size="sm" />

            <div className="relative flex-1 min-w-0">
              <select
                value={selectedKey}
                onChange={(e) => handleSelectAlgorithm(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-white pr-6 appearance-none cursor-pointer focus:outline-none truncate"
              >
                {Object.entries(implemented).map(([key, entry]) => (
                  <option key={key} value={key} className="bg-slate-900 text-white">
                    {entry.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              />
            </div>

            <button
              onClick={handleAddAgent}
              className="p-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shrink-0"
              title="Add agent to starting line"
            >
              <UserPlus size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Racers List / Live Standings */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pt-2 pr-1">
        {agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-28 text-center text-slate-500 gap-1.5">
            <Bot size={24} className="opacity-40" />
            <span className="text-[11px]">No racers registered.</span>
            <span className="text-[10px] text-slate-600">
              Click Quick Match or add an algorithm above.
            </span>
          </div>
        ) : showStandingsMode ? (
          /* Live Standings Render */
          ranked.map((agent, index) => {
            const meta = ALGORITHMS[agent.algorithmKey];
            const label = meta ? meta.label : agent.algorithmKey;
            const dist = distToNearestGoal(agent.position);
            const nodesExplored = agent.result ? agent.result.nodesExplored : agent.visitedNodes.size;

            let rankColor = 'text-slate-400';
            if (agent.status === 'done' && agent.result?.status === 'success') {
              if (index === 0) rankColor = 'text-amber-400 font-bold';
              else if (index === 1) rankColor = 'text-slate-300 font-bold';
              else if (index === 2) rankColor = 'text-amber-600 font-bold';
            }

            return (
              <div
                key={agent.id}
                className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-[11px] font-mono ${rankColor} w-4 text-center shrink-0`}>
                    #{index + 1}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: agent.color }}
                  />
                  <span className="truncate font-semibold text-[11px]">{label}</span>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono shrink-0">
                  {agent.status === 'running' && (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Loader2 size={10} className="animate-spin" />
                      {dist} left
                    </span>
                  )}
                  {agent.status === 'done' && agent.result?.status === 'success' && (
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle2 size={11} />
                      {agent.result.cost ?? agent.result.path?.length}c
                    </span>
                  )}
                  {agent.status === 'done' && agent.result?.status === 'trapped' && (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertTriangle size={11} />
                      trapped
                    </span>
                  )}
                  {agent.status === 'done' && agent.result?.status === 'failed' && (
                    <span className="text-slate-500 flex items-center gap-1">
                      <XCircle size={11} />
                      failed
                    </span>
                  )}

                  {/* Explored count */}
                  <span className="text-slate-500 text-[9px]">{nodesExplored}n</span>
                </div>
              </div>
            );
          })
        ) : (
          /* Pre-Race Roster Render */
          agents.map((agent) => {
            const meta = ALGORITHMS[agent.algorithmKey];
            const label = meta ? meta.label : agent.algorithmKey;

            return (
              <div
                key={agent.id}
                className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs hover:border-white/10 transition-colors"
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
                  <span className="truncate font-medium text-[11px]">{label}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Overlay Eye Toggle */}
                  <button
                    onClick={() => {
                      toggleOverlay(agent.id);
                      playClick();
                    }}
                    className={`p-1 rounded transition-colors ${
                      agent.showOverlay
                        ? 'text-blue-400 hover:bg-white/10'
                        : 'text-slate-600 hover:bg-white/10'
                    }`}
                    title={agent.showOverlay ? 'Hide scout overlay' : 'Show scout overlay'}
                  >
                    {agent.showOverlay ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>

                  {/* Remove Agent */}
                  <button
                    onClick={() => {
                      removeAgent(agent.id);
                      playClick();
                    }}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-white/10 transition-colors"
                    title="Remove racer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
