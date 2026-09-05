/**
 * StartMenu — Game start menu and title screen launcher.
 *
 * Provides a tactile, game-like onboarding interface before jumping into the arena:
 * - Quick Match (Instant A* vs BFS race)
 * - Map Preset Browser
 * - Freeform Arena Sandbox
 * - Player Manual & Hotkeys
 * - Audio toggle & game controls overview
 *
 * @module ui/StartMenu
 */

import { useEffect } from 'react';
import { useGameMenuStore } from '../state/gameMenuStore';
import { useAgentStore } from '../state/agentStore';
import { useGridStore } from '../state/gridStore';
import { useRaceStore } from '../state/raceStore';
import { useSoundStore } from '../state/soundStore';
import { ALGORITHMS } from '../algorithms';
import { playClick, playStartFanfare } from '../utils/sound';
import {
  Map,
  Hammer,
  BookOpen,
  Volume2,
  VolumeX,
  Swords,
  ChevronRight,
} from 'lucide-react';

interface StartMenuProps {
  onOpenHelp?: () => void;
}

export function StartMenu({ onOpenHelp }: StartMenuProps = {}) {
  const isOpen = useGameMenuStore((s) => s.isStartMenuOpen);
  const closeStartMenu = useGameMenuStore((s) => s.closeStartMenu);
  const openPresetChooser = useGameMenuStore((s) => s.openPresetChooser);

  const start = useGridStore((s) => s.start);
  const addAgent = useAgentStore((s) => s.addAgent);
  const removeAgent = useAgentStore((s) => s.removeAgent);
  const agents = useAgentStore((s) => s.agents);
  const startRace = useRaceStore((s) => s.startRace);

  const soundEnabled = useSoundStore((s) => s.enabled);
  const toggleSound = useSoundStore((s) => s.toggleSound);

  // Keyboard support: Space or Enter to jump straight into arena
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        closeStartMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeStartMenu]);

  if (!isOpen) return null;

  const handleQuickMatch = () => {
    // Clear and set up A* and BFS
    agents.forEach((a) => removeAgent(a.id));
    if (ALGORITHMS.astar) {
      addAgent('astar', ALGORITHMS.astar.color, start);
    }
    if (ALGORITHMS.bfs) {
      addAgent('bfs', ALGORITHMS.bfs.color, start);
    }
    closeStartMenu();
    startRace();
    playStartFanfare();
  };

  const handleEnterSandbox = () => {
    closeStartMenu();
    playClick();
  };

  const handleOpenPresets = () => {
    openPresetChooser();
    playClick();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900/95 border border-white/10 rounded-2xl p-7 max-w-md w-full text-slate-200 shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Game Title Header */}
        <div className="flex flex-col items-center text-center gap-1.5 border-b border-white/10 pb-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-semibold tracking-wider uppercase mb-1">
            Tactical Pathfinding Simulator
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
            AlgoArena
          </h1>

          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Race classical search algorithms in real-time across desert terrain, boulders, and traps.
          </p>
        </div>

        {/* Menu Actions */}
        <div className="flex flex-col gap-2.5">
          {/* Quick Match Action */}
          <button
            onClick={handleQuickMatch}
            className="flex items-center justify-between p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md group"
          >
            <div className="flex items-center gap-3">
              <Swords size={16} className="text-blue-200" />
              <div className="text-left">
                <div className="font-bold">Quick Match: A* vs BFS</div>
                <div className="text-[10px] text-blue-200 font-normal">
                  Instant 2-agent showdown on current board
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Map Preset Chooser */}
          <button
            onClick={handleOpenPresets}
            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Map size={16} className="text-amber-400" />
              <div className="text-left">
                <div className="font-semibold">Choose Map Preset</div>
                <div className="text-[10px] text-slate-400">
                  7 curated arenas + custom user maps
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Enter Sandbox */}
          <button
            onClick={handleEnterSandbox}
            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Hammer size={16} className="text-slate-300" />
              <div className="text-left">
                <div className="font-semibold">Enter Arena Sandbox</div>
                <div className="text-[10px] text-slate-400">
                  Freeform tool palette to paint walls & configure agents
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Game Manual */}
          {onOpenHelp && (
            <button
              onClick={() => {
                onOpenHelp();
                playClick();
              }}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs transition-colors group"
            >
              <div className="flex items-center gap-3">
                <BookOpen size={16} className="text-emerald-400" />
                <div className="text-left">
                  <div className="font-semibold">Manual & Hotkeys</div>
                  <div className="text-[10px] text-slate-400">
                    Algorithm traits, tile rules, and keyboard controls
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Footer: Audio toggle & hotkey reminder */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-slate-500">
          <button
            onClick={() => {
              toggleSound();
              playClick();
            }}
            className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
            title={soundEnabled ? 'Mute sound FX' : 'Enable sound FX'}
          >
            {soundEnabled ? <Volume2 size={13} className="text-amber-400" /> : <VolumeX size={13} />}
            <span>Audio {soundEnabled ? 'Enabled' : 'Muted'}</span>
          </button>

          <span className="font-mono text-[10px]">
            Press <kbd className="text-slate-300 font-bold bg-white/10 px-1 py-0.5 rounded">Space</kbd> to enter
          </span>
        </div>
      </div>
    </div>
  );
}
