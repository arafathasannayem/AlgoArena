/**
 * PauseMenu — Authentic indie-game tactical in-game pause menu.
 *
 * Appears when pressing [Esc], clicking Pause in the top bar, or opening [M].
 * Freezes the active race simulation and provides:
 * - Match telemetry (map name, dimensions, registered agents, goals)
 * - Tactile keyboard navigation (Up/Down + Enter, Esc)
 * - Quick match reset, map switching, layout saving, and title return
 * - Collapsible Audio & Settings drawer (master volume, 3D/2D view, cost labels)
 *
 * @module ui/PauseMenu
 */

import { useState, useEffect, useMemo } from 'react';
import { useGameMenuStore } from '../state/gameMenuStore';
import { useRaceStore } from '../state/raceStore';
import { useGridStore } from '../state/gridStore';
import { useAgentStore } from '../state/agentStore';
import { useCameraStore } from '../state/cameraStore';
import { useSoundStore } from '../state/soundStore';
import {
  playClick,
  playMenuHover,
} from '../utils/sound';
import {
  Play,
  RotateCcw,
  Map,
  Save,
  Sliders,
  BookOpen,
  LogOut,
  Volume2,
  VolumeX,
  Compass,
  Grid,
  Eye,
  EyeOff,
  ChevronDown,
  X,
} from 'lucide-react';

interface PauseMenuProps {
  onOpenHelp?: () => void;
}

export function PauseMenu({ onOpenHelp }: PauseMenuProps = {}) {
  const isOpen = useGameMenuStore((s) => s.isPauseMenuOpen);
  const closePauseMenu = useGameMenuStore((s) => s.closePauseMenu);
  const openTitleScreen = useGameMenuStore((s) => s.openTitleScreen);
  const openPresetChooser = useGameMenuStore((s) => s.openPresetChooser);
  const openSavePreset = useGameMenuStore((s) => s.openSavePreset);
  const currentMapTitle = useGameMenuStore((s) => s.currentMapTitle);

  const resetRace = useRaceStore((s) => s.resetRace);
  const raceStatus = useRaceStore((s) => s.status);
  const wasRunning = useGameMenuStore((s) => s.wasRunningBeforePause);

  const width = useGridStore((s) => s.width);
  const height = useGridStore((s) => s.height);
  const goalsCount = useGridStore((s) => s.goals.length);
  const showCostLabels = useGridStore((s) => s.showCostLabels);
  const toggleCostLabels = useGridStore((s) => s.toggleCostLabels);

  const agentsCount = useAgentStore((s) => s.agents.length);

  const isTopDown = useCameraStore((s) => s.isTopDown);
  const triggerResetCamera = useCameraStore((s) => s.triggerReset);
  const triggerTopDown = useCameraStore((s) => s.triggerPreset);

  const soundEnabled = useSoundStore((s) => s.enabled);
  const toggleSound = useSoundStore((s) => s.toggleSound);
  const volume = useSoundStore((s) => s.volume);
  const setVolume = useSoundStore((s) => s.setVolume);

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const menuOptions = useMemo(
    () => [
      {
        id: 'resume',
        label: 'Resume Expedition',
        shortcut: 'ESC',
        icon: <Play size={16} className="text-emerald-400" />,
        action: () => closePauseMenu(),
      },
      {
        id: 'restart',
        label: 'Restart Run',
        shortcut: 'R',
        icon: <RotateCcw size={16} className="text-blue-400" />,
        action: () => {
          resetRace();
          closePauseMenu();
        },
      },
      {
        id: 'presets',
        label: 'Map Archive',
        shortcut: 'P',
        icon: <Map size={16} className="text-blue-400" />,
        action: () => {
          closePauseMenu();
          openPresetChooser();
        },
      },
      {
        id: 'save',
        label: 'Save Arena Layout',
        shortcut: 'S',
        icon: <Save size={16} className="text-cyan-400" />,
        action: () => {
          closePauseMenu();
          openSavePreset();
        },
      },
      {
        id: 'settings',
        label: 'Audio & Settings',
        icon: <Sliders size={16} className="text-purple-400" />,
        action: () => setShowSettings((prev) => !prev),
      },
      {
        id: 'manual',
        label: 'Field Manual & Rules',
        shortcut: '?',
        icon: <BookOpen size={16} className="text-emerald-400" />,
        action: () => {
          closePauseMenu();
          onOpenHelp?.();
        },
      },
      {
        id: 'title',
        label: 'Abandon to Title',
        icon: <LogOut size={16} className="text-red-400" />,
        action: () => {
          resetRace();
          openTitleScreen();
        },
      },
    ],
    [closePauseMenu, resetRace, openPresetChooser, openSavePreset, onOpenHelp, openTitleScreen],
  );

  // Keyboard navigation when Pause Menu is active
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((prev) => {
          const next = (prev + 1) % menuOptions.length;
          playMenuHover();
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((prev) => {
          const next = (prev - 1 + menuOptions.length) % menuOptions.length;
          playMenuHover();
          return next;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const opt = menuOptions[selectedIdx];
        if (opt) {
          playClick();
          opt.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIdx, menuOptions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900/95 border border-white/10 rounded-2xl p-6 max-w-md w-full text-slate-200 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Telemetry Header */}
        <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Tactical Pause
            </div>

            <button
              onClick={() => {
                closePauseMenu();
                playClick();
              }}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Resume [ESC]"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col">
            <h2 className="text-xl font-black tracking-tight text-white uppercase font-sans">
              {currentMapTitle}
            </h2>

            {/* Board Telemetry Pills */}
            <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono font-semibold text-slate-400">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                {width}×{height} GRID
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                {agentsCount} {agentsCount === 1 ? 'RACER' : 'RACERS'}
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                {goalsCount} {goalsCount === 1 ? 'GOAL' : 'GOALS'}
              </span>
              <span
                className={`px-2 py-0.5 rounded border ${
                  wasRunning || raceStatus === 'running'
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                    : 'bg-white/5 text-slate-300 border-white/10'
                }`}
              >
                {wasRunning ? 'PAUSED MID-RACE' : 'STANDBY'}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Tactical Actions Menu */}
        <div className="flex flex-col gap-1.5">
          {menuOptions.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            const isSettingsOpt = opt.id === 'settings';

            return (
              <div key={opt.id} className="flex flex-col">
                <button
                  onMouseEnter={() => {
                    if (selectedIdx !== idx) {
                      setSelectedIdx(idx);
                      playMenuHover();
                    }
                  }}
                  onClick={() => {
                    playClick();
                    opt.action();
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? opt.id === 'resume'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 translate-x-0.5'
                        : 'bg-white/15 text-white border border-white/20 translate-x-0.5'
                      : 'bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded-lg bg-white/5 shrink-0">
                      {opt.icon}
                    </div>
                    <span>{opt.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSettingsOpt && (
                      <ChevronDown
                        size={14}
                        className={`text-slate-400 transition-transform duration-200 ${
                          showSettings ? 'rotate-180 text-purple-400' : ''
                        }`}
                      />
                    )}
                    {opt.shortcut && (
                      <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400">
                        {opt.shortcut}
                      </kbd>
                    )}
                  </div>
                </button>

                {/* Collapsible Audio & Settings Drawer */}
                {isSettingsOpt && showSettings && (
                  <div className="mt-1.5 mb-1 p-3 rounded-xl bg-slate-950/60 border border-purple-500/30 flex flex-col gap-3 animate-in fade-in duration-150">
                    {/* Master Volume Slider */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-300 flex items-center gap-1.5">
                          <Volume2 size={13} className="text-amber-400" />
                          Master Volume
                        </span>
                        <span className="font-mono text-amber-300 font-bold text-[10px]">
                          {Math.round(volume * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={volume}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          setVolume(v);
                          playClick();
                        }}
                        className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                      />
                    </div>

                    {/* Mute and Toggles Row */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
                      {/* Audio Mute */}
                      <button
                        onClick={() => {
                          toggleSound();
                          playClick();
                        }}
                        className={`p-2 rounded-lg flex items-center justify-between text-[11px] border transition-colors ${
                          soundEnabled
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      >
                        <span className="font-medium">Audio SFX</span>
                        {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                      </button>

                      {/* Tile Cost Numbers */}
                      <button
                        onClick={() => {
                          toggleCostLabels();
                          playClick();
                        }}
                        className={`p-2 rounded-lg flex items-center justify-between text-[11px] border transition-colors ${
                          showCostLabels
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      >
                        <span className="font-medium">Cost Badges</span>
                        {showCostLabels ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                    </div>

                    {/* Camera Perspective Toggle */}
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px]">
                      <span className="font-medium text-slate-300 pl-1">Camera Mode</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            triggerResetCamera();
                            playClick();
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 ${
                            !isTopDown
                              ? 'bg-white/20 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Compass size={11} /> 3D Iso
                        </button>
                        <button
                          onClick={() => {
                            triggerTopDown('top');
                            playClick();
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 ${
                            isTopDown
                              ? 'bg-white/20 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Grid size={11} /> 2D Top
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer: Keyboard Nav Guide */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-400">↑/↓</kbd>
            <span>Navigate</span>
            <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-400 ml-1">Enter</kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-400">Esc</kbd>
            <span>Resume</span>
          </div>
        </div>
      </div>
    </div>
  );
}
