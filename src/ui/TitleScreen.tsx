/**
 * TitleScreen — Cinematic indie game title launcher.
 *
 * Provides a tactile, game-like onboarding interface before entering the arena:
 * - Quick Match (Instant A* vs BFS race)
 * - Map Preset Archives (7 curated challenges + custom maps)
 * - Arena Sandbox (Freeform tool palette to paint walls & place agents)
 * - Field Manual & Hotkey Legend
 * - Audio volume and settings directly accessible
 *
 * @module ui/TitleScreen
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useGameMenuStore } from '../state/gameMenuStore';
import { useAgentStore } from '../state/agentStore';
import { useGridStore } from '../state/gridStore';
import { useRaceStore } from '../state/raceStore';
import { useSoundStore } from '../state/soundStore';
import { ALGORITHMS } from '../algorithms';
import { playClick, playMenuHover, playStartFanfare } from '../utils/sound';
import {
  Map,
  Hammer,
  BookOpen,
  Volume2,
  VolumeX,
  Swords,
  ChevronRight,
  Sliders,
} from 'lucide-react';

interface TitleScreenProps {
  onOpenHelp?: () => void;
}

export function TitleScreen({ onOpenHelp }: TitleScreenProps = {}) {
  const isOpen = useGameMenuStore((s) => s.isTitleScreenOpen);
  const closeTitleScreen = useGameMenuStore((s) => s.closeTitleScreen);
  const openPresetChooser = useGameMenuStore((s) => s.openPresetChooser);

  const start = useGridStore((s) => s.start);
  const addAgent = useAgentStore((s) => s.addAgent);
  const removeAgent = useAgentStore((s) => s.removeAgent);
  const agents = useAgentStore((s) => s.agents);
  const startRace = useRaceStore((s) => s.startRace);

  const soundEnabled = useSoundStore((s) => s.enabled);
  const toggleSound = useSoundStore((s) => s.toggleSound);
  const volume = useSoundStore((s) => s.volume);
  const setVolume = useSoundStore((s) => s.setVolume);

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const handleQuickMatch = useCallback(() => {
    agents.forEach((a) => removeAgent(a.id));
    if (ALGORITHMS.astar) {
      addAgent('astar', ALGORITHMS.astar.color, start);
    }
    if (ALGORITHMS.bfs) {
      addAgent('bfs', ALGORITHMS.bfs.color, start);
    }
    closeTitleScreen();
    startRace();
    playStartFanfare();
  }, [agents, removeAgent, addAgent, start, closeTitleScreen, startRace]);

  const handleEnterSandbox = useCallback(() => {
    closeTitleScreen();
    playClick();
  }, [closeTitleScreen]);

  const handleOpenPresets = useCallback(() => {
    openPresetChooser();
    playClick();
  }, [openPresetChooser]);

  const handleOpenManual = useCallback(() => {
    onOpenHelp?.();
    playClick();
  }, [onOpenHelp]);

  const options = useMemo(() => [
    {
      id: 'quickmatch',
      title: 'Quick Match',
      desc: 'A* vs BFS two-agent race',
      badge: 'BATTLE',
      badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      icon: <Swords size={18} className="text-amber-400" />,
      action: handleQuickMatch,
    },
    {
      id: 'presets',
      title: 'Map Preset Archives',
      desc: '7 curated arenas + user saved maps',
      badge: 'ARCHIVE',
      badgeColor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      icon: <Map size={18} className="text-blue-400" />,
      action: handleOpenPresets,
    },
    {
      id: 'sandbox',
      title: 'Arena Sandbox Mode',
      desc: 'Freeform editor to design mazes & place agents',
      badge: 'BUILDER',
      badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      icon: <Hammer size={18} className="text-emerald-400" />,
      action: handleEnterSandbox,
    },
    {
      id: 'manual',
      title: 'Field Manual & Controls',
      desc: 'Algorithm mechanics, tile costs & hotkeys',
      badge: 'GUIDE',
      badgeColor: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
      icon: <BookOpen size={18} className="text-purple-400" />,
      action: handleOpenManual,
    },
  ], [handleQuickMatch, handleOpenPresets, handleEnterSandbox, handleOpenManual]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((prev) => {
          const next = (prev + 1) % options.length;
          playMenuHover();
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((prev) => {
          const next = (prev - 1 + options.length) % options.length;
          playMenuHover();
          return next;
        });
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const opt = options[selectedIdx];
        if (opt) {
          opt.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIdx, options]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900/95 border border-white/10 rounded-2xl p-7 max-w-md w-full text-slate-200 shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Title Header */}
        <div className="flex flex-col items-center text-center gap-1.5 border-b border-white/10 pb-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold tracking-widest uppercase mb-1">
            Tactical Search Expedition
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white uppercase font-sans">
            AlgoArena
          </h1>

          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Race search algorithms in real-time across desert terrain, boulders, high-cost scrub, and traps.
          </p>
        </div>

        {/* Action Cards */}
        <div className="flex flex-col gap-2">
          {options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={opt.id}
                onMouseEnter={() => {
                  if (selectedIdx !== idx) {
                    setSelectedIdx(idx);
                    playMenuHover();
                  }
                }}
                onClick={opt.action}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-white/15 border-white/25 text-white translate-x-1 shadow-lg'
                    : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-white/5 shrink-0">
                    {opt.icon}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs truncate">{opt.title}</span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${opt.badgeColor}`}>
                        {opt.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">{opt.desc}</span>
                  </div>
                </div>

                <ChevronRight
                  size={16}
                  className={`shrink-0 transition-transform ${
                    isSelected ? 'translate-x-0.5 text-white' : 'text-slate-500'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Quick Audio & Settings Drawer Toggle */}
        <div className="flex flex-col gap-2 pt-1 border-t border-white/10">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <button
              onClick={() => {
                setShowSettings((s) => !s);
                playClick();
              }}
              className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
            >
              <Sliders size={13} className="text-slate-400" />
              <span>Audio & Controls</span>
            </button>

            <span className="font-mono text-[10px]">
              Press <kbd className="text-slate-300 font-bold bg-white/10 px-1 py-0.5 rounded">Enter</kbd> to Launch
            </span>
          </div>

          {showSettings && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col gap-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Volume2 size={13} className="text-amber-400" />
                  Volume: {Math.round(volume * 100)}%
                </span>
                <button
                  onClick={() => {
                    toggleSound();
                    playClick();
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors flex items-center gap-1 ${
                    soundEnabled
                      ? 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  {soundEnabled ? <Volume2 size={11} /> : <VolumeX size={11} />}
                  <span>{soundEnabled ? 'AUDIO ON' : 'MUTED'}</span>
                </button>
              </div>

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  playClick();
                }}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
