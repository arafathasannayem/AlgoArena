/**
 * PauseMenu — Brick Racer In-Game Tactical Pause Menu.
 *
 * Implements Section 4.3 of the UI/UX Guidelines:
 * - Brick White (#F4F4F4) card on dark scrim (rgba(5,19,29,0.6)).
 * - 20px corner radius, 3px black outline (#05131D), hard offset shadow 0 8px 0 rgba(5,19,29,0.35).
 * - Row of 4 raised LEGO studs at the top edge.
 * - Circular Reddish-Brown (#582A12) 1x1 round close button in top right.
 * - Tactile brick buttons with 2px/3px press depth.
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
  playSnap,
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
        label: 'Resume Race',
        shortcut: 'ESC',
        icon: <Play size={16} className="fill-current text-[#F4F4F4]" />,
        isPrimary: true,
        action: () => closePauseMenu(),
      },
      {
        id: 'restart',
        label: 'Restart Run',
        shortcut: 'R',
        icon: <RotateCcw size={16} />,
        action: () => {
          resetRace();
          closePauseMenu();
        },
      },
      {
        id: 'presets',
        label: 'Map Presets',
        shortcut: 'P',
        icon: <Map size={16} className="text-[#0055BF]" />,
        action: () => {
          closePauseMenu();
          openPresetChooser();
        },
      },
      {
        id: 'save',
        label: 'Save Board Map',
        shortcut: 'S',
        icon: <Save size={16} className="text-[#0055BF]" />,
        action: () => {
          closePauseMenu();
          openSavePreset();
        },
      },
      {
        id: 'settings',
        label: 'Audio & Settings',
        icon: <Sliders size={16} className="text-[#923978]" />,
        action: () => setShowSettings((prev) => !prev),
      },
      {
        id: 'manual',
        label: 'How it Works & Rules',
        shortcut: '?',
        icon: <BookOpen size={16} className="text-[#237841]" />,
        action: () => {
          closePauseMenu();
          onOpenHelp?.();
        },
      },
      {
        id: 'title',
        label: 'Exit to Title',
        icon: <LogOut size={16} className="text-[#C91A09]" />,
        action: () => {
          resetRace();
          openTitleScreen();
        },
      },
    ],
    [closePauseMenu, resetRace, openPresetChooser, openSavePreset, onOpenHelp, openTitleScreen],
  );

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
    <div className="fixed inset-0 bg-[#05131D]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#F4F4F4] border-[3px] border-[#05131D] rounded-3xl p-6 max-w-md w-full text-[#05131D] shadow-[0_8px_0_rgba(5,19,29,0.35)] flex flex-col gap-4 relative">
        {/* 4 Raised Studs Header Affordance (§4.3) */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-4 h-2.5 rounded-t-full bg-[#A3A2A4] border-2 border-b-0 border-[#05131D]" />
          <div className="w-4 h-2.5 rounded-t-full bg-[#A3A2A4] border-2 border-b-0 border-[#05131D]" />
          <div className="w-4 h-2.5 rounded-t-full bg-[#A3A2A4] border-2 border-b-0 border-[#05131D]" />
          <div className="w-4 h-2.5 rounded-t-full bg-[#A3A2A4] border-2 border-b-0 border-[#05131D]" />
        </div>

        {/* Circular Reddish-Brown 1x1 Round Close Button (§4.3) */}
        <button
          onClick={() => {
            closePauseMenu();
            playClick();
          }}
          className="absolute right-4 top-4 w-7 h-7 rounded-full bg-[#582A12] hover:bg-[#6e3618] border-2 border-[#05131D] text-[#F4F4F4] flex items-center justify-center shadow-[0_2px_0_#05131D] active:translate-y-0.5 cursor-pointer"
          title="Close [ESC]"
        >
          <X size={14} />
        </button>

        {/* Header Telemetry */}
        <div className="flex flex-col gap-1 border-b-2 border-[#05131D]/15 pb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#05131D]/10 border border-[#05131D]/20 text-[#05131D] text-[10px] font-mono font-bold tracking-widest uppercase w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0055BF] animate-pulse" />
            RACE PAUSED
          </div>

          <h2 className="text-xl font-black tracking-tight text-[#05131D] uppercase font-display">
            {currentMapTitle}
          </h2>

          {/* Telemetry badges */}
          <div className="flex items-center gap-2 mt-1 text-[10px] font-mono font-bold text-[#595D60]">
            <span className="px-2 py-0.5 rounded-md bg-white border border-[#05131D]/30">
              {width}×{height} GRID
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-[#05131D]/30">
              {agentsCount} {agentsCount === 1 ? 'RACER' : 'RACERS'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-[#05131D]/30">
              {goalsCount} {goalsCount === 1 ? 'GOAL' : 'GOALS'}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md border ${
                wasRunning || raceStatus === 'running'
                  ? 'bg-[#0055BF]/15 text-[#0055BF] border-[#0055BF]/40'
                  : 'bg-white text-[#595D60] border-[#05131D]/30'
              }`}
            >
              {wasRunning ? 'MID-RACE' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* Menu Options List */}
        <div className="flex flex-col gap-1.5">
          {menuOptions.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            const isPrimary = opt.isPrimary;
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
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold brick-btn cursor-pointer transition-all ${
                    isPrimary
                      ? 'bg-[#C91A09] text-[#F4F4F4]'
                      : isSelected
                        ? 'bg-white text-[#05131D] ring-2 ring-[#0055BF]'
                        : 'bg-white/80 hover:bg-white text-[#05131D]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded-lg shrink-0">
                      {opt.icon}
                    </div>
                    <span>{opt.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSettingsOpt && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          showSettings ? 'rotate-180 text-[#923978]' : ''
                        }`}
                      />
                    )}
                    {opt.shortcut && (
                      <kbd
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                          isPrimary
                            ? 'bg-[#05131D]/30 text-white border-transparent'
                            : 'bg-[#05131D]/10 text-[#05131D] border-[#05131D]/20'
                        }`}
                      >
                        {opt.shortcut}
                      </kbd>
                    )}
                  </div>
                </button>

                {/* Collapsible Audio & Settings Drawer */}
                {isSettingsOpt && showSettings && (
                  <div className="mt-1.5 mb-1 p-3 rounded-2xl bg-white border-2 border-[#05131D] flex flex-col gap-3 shadow-[0_2px_0_#05131D]">
                    {/* Volume Slider */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold flex items-center gap-1.5">
                          <Volume2 size={13} className="text-[#AA7F2E]" />
                          Master Volume
                        </span>
                        <span className="font-mono font-bold text-[10px]">
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
                          setVolume(parseFloat(e.target.value));
                          playClick();
                        }}
                        className="w-full accent-[#C91A09] cursor-pointer h-2 bg-[#A3A2A4]/40 rounded-lg"
                      />
                    </div>

                    {/* SFX and Tile Numbers Row */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#05131D]/10">
                      <button
                        onClick={() => {
                          toggleSound();
                          playSnap();
                        }}
                        className={`p-2 rounded-xl flex items-center justify-between text-xs font-bold border-2 border-[#05131D] cursor-pointer ${
                          soundEnabled
                            ? 'bg-[#F2CD37] text-[#05131D]'
                            : 'bg-[#A3A2A4] text-[#05131D]'
                        }`}
                      >
                        <span>Audio FX</span>
                        {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                      </button>

                      <button
                        onClick={() => {
                          toggleCostLabels();
                          playSnap();
                        }}
                        className={`p-2 rounded-xl flex items-center justify-between text-xs font-bold border-2 border-[#05131D] cursor-pointer ${
                          showCostLabels
                            ? 'bg-[#F2CD37] text-[#05131D]'
                            : 'bg-[#A3A2A4] text-[#05131D]'
                        }`}
                      >
                        <span>Cost Badges</span>
                        {showCostLabels ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                    </div>

                    {/* Camera Perspective Mode */}
                    <div className="flex items-center justify-between p-1.5 rounded-xl bg-[#e8e8e8] border border-[#05131D]/20 text-xs">
                      <span className="font-bold pl-1">Camera Mode</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            triggerResetCamera();
                            playClick();
                          }}
                          className={`px-2 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            !isTopDown
                              ? 'bg-white border-[#05131D] text-[#05131D] shadow-sm'
                              : 'text-[#595D60] border-transparent hover:text-[#05131D]'
                          }`}
                        >
                          <Compass size={12} className="inline mr-1" /> 3D Iso
                        </button>
                        <button
                          onClick={() => {
                            triggerTopDown('top');
                            playClick();
                          }}
                          className={`px-2 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            isTopDown
                              ? 'bg-white border-[#05131D] text-[#05131D] shadow-sm'
                              : 'text-[#595D60] border-transparent hover:text-[#05131D]'
                          }`}
                        >
                          <Grid size={12} className="inline mr-1" /> 2D Top
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Nav Guide */}
        <div className="flex items-center justify-between pt-2 border-t-2 border-[#05131D]/15 text-[10px] font-mono text-[#595D60]">
          <div className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-white border border-[#05131D]/20 text-[#05131D] font-bold">
              ↑/↓
            </kbd>
            <span>Navigate</span>
            <kbd className="px-1 py-0.5 rounded bg-white border border-[#05131D]/20 text-[#05131D] font-bold ml-1">
              Enter
            </kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-white border border-[#05131D]/20 text-[#05131D] font-bold">
              Esc
            </kbd>
            <span>Resume</span>
          </div>
        </div>
      </div>
    </div>
  );
}
