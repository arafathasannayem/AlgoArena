/**
 * TitleScreen — Main Launcher & Board Theme Selector.
 *
 * Implements Section 4.1 & 4.2 of the UI/UX Guidelines:
 * - Center-aligned layout inspired by LEGO Party! board selection screen.
 * - Horizontal row of 4 theme cards (Classic, Castle, Space, City) with 4 raised studs.
 * - Primary CTA: Large Brick Red (#C91A09) [ 🔨 SANDBOX MODE ] button.
 * - Secondary controls: Start Race (instant all 7 race), Map Presets, and How it Works.
 *
 * @module ui/TitleScreen
 */

import { useState, useEffect, useCallback } from 'react';
import { useGameMenuStore } from '../state/gameMenuStore';
import { useAgentStore } from '../state/agentStore';
import { useGridStore } from '../state/gridStore';
import { useRaceStore } from '../state/raceStore';
import { useSoundStore } from '../state/soundStore';
import { useThemeStore, type BoardThemeId, THEMES } from '../state/themeStore';
import { ALGORITHMS } from '../algorithms';
import { playClick, playSnap, playStartFanfare } from '../utils/sound';
import {
  Play,
  Map,
  BookOpen,
  Volume2,
  VolumeX,
  Sliders,
  Hammer,
} from 'lucide-react';

interface TitleScreenProps {
  onOpenHelp?: () => void;
}

export function TitleScreen({ onOpenHelp }: TitleScreenProps = {}) {
  const isOpen = useGameMenuStore((s) => s.isTitleScreenOpen);
  const closeTitleScreen = useGameMenuStore((s) => s.closeTitleScreen);
  const openPresetChooser = useGameMenuStore((s) => s.openPresetChooser);

  const currentThemeId = useThemeStore((s) => s.currentThemeId);
  const setTheme = useThemeStore((s) => s.setTheme);

  const start = useGridStore((s) => s.start);
  const agents = useAgentStore((s) => s.agents);
  const addAgent = useAgentStore((s) => s.addAgent);
  const startRace = useRaceStore((s) => s.startRace);

  const soundEnabled = useSoundStore((s) => s.enabled);
  const toggleSound = useSoundStore((s) => s.toggleSound);
  const volume = useSoundStore((s) => s.volume);
  const setVolume = useSoundStore((s) => s.setVolume);

  const [showSettings, setShowSettings] = useState(false);

  const handleEnterSandbox = useCallback(() => {
    closeTitleScreen();
    playClick();
  }, [closeTitleScreen]);

  const handleStartRace = () => {
    // If no agents placed, place all 7 algorithms
    if (agents.length === 0) {
      Object.entries(ALGORITHMS).forEach(([key, entry]) => {
        addAgent(key, entry.color, start);
      });
    }
    closeTitleScreen();
    startRace();
    playStartFanfare();
  };

  const handleOpenPresets = () => {
    openPresetChooser();
    playClick();
  };

  const handleOpenHelp = () => {
    onOpenHelp?.();
    playClick();
  };

  const handleThemeSelect = (themeId: BoardThemeId) => {
    setTheme(themeId);
    playSnap();
  };

  // Keyboard shortcut to launch primary CTA
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleEnterSandbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleEnterSandbox]);

  if (!isOpen) return null;

  const themeList: BoardThemeId[] = ['classic', 'castle', 'space', 'city'];

  return (
    <div className="fixed inset-0 bg-[#05131D]/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#F4F4F4] border-[3px] border-[#05131D] rounded-3xl p-6 sm:p-8 max-w-xl w-full text-[#05131D] shadow-[0_12px_0_rgba(5,19,29,0.4)] flex flex-col gap-6 relative">
        {/* 4 Raised LEGO Studs Header Affordance */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-4 h-2.5 rounded-t-full bg-[#A3A2A4] border-2 border-b-0 border-[#05131D]" />
          <div className="w-4 h-2.5 rounded-t-full bg-[#A3A2A4] border-2 border-b-0 border-[#05131D]" />
          <div className="w-4 h-2.5 rounded-t-full bg-[#A3A2A4] border-2 border-b-0 border-[#05131D]" />
          <div className="w-4 h-2.5 rounded-t-full bg-[#A3A2A4] border-2 border-b-0 border-[#05131D]" />
        </div>

        {/* Title Header */}
        <div className="flex flex-col items-center text-center gap-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#F2CD37] border-2 border-[#05131D] text-[#05131D] text-[10px] font-mono font-bold tracking-widest uppercase mb-1 shadow-[0_2px_0_#05131D]">
            BRICK RACER CHAMPIONSHIP
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#05131D] uppercase font-display">
            Algorithm Arena
          </h1>

          <p className="text-xs sm:text-sm text-[#595D60] font-semibold max-w-md">
            Pick a board theme, paint walls, and race 7 search algorithms in real-time.
          </p>
        </div>

        {/* Board Theme Select Cards (Section 4.1 & 4.2) */}
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-bold text-[#595D60] uppercase tracking-wider text-center">
            Select Board Theme
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {themeList.map((id) => {
              const theme = THEMES[id];
              const isSelected = currentThemeId === id;

              return (
                <button
                  key={id}
                  onClick={() => handleThemeSelect(id)}
                  className={`flex flex-col items-center text-center p-2.5 rounded-2xl border-[3px] transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#F2CD37]/20 border-[#05131D] shadow-[0_4px_0_#05131D] -translate-y-1 ring-2 ring-[#F2CD37]'
                      : 'bg-white border-[#05131D]/40 hover:border-[#05131D] shadow-[0_2px_0_#05131D]/30 hover:-translate-y-0.5'
                  }`}
                >
                  {/* Theme Preview Swatch Tile */}
                  <div
                    className="w-full h-12 rounded-xl border-2 border-[#05131D] mb-2 relative overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: theme.baseplateColor }}
                  >
                    {/* Simulated studs */}
                    <div className="grid grid-cols-3 gap-1.5 opacity-60">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full border border-[#05131D]/40"
                          style={{ backgroundColor: theme.studColor }}
                        />
                      ))}
                    </div>
                    {/* Wall brick accent */}
                    <div
                      className="absolute bottom-1 right-1 w-5 h-4 rounded border border-[#05131D] shadow-sm"
                      style={{ backgroundColor: theme.wallColor }}
                    />
                  </div>

                  <span className="font-display font-black text-xs text-[#05131D] uppercase">
                    {theme.label.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-[#595D60] truncate max-w-full">
                    {theme.label.split(' ')[1] ?? 'Board'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary CTA: Sandbox Mode */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={handleEnterSandbox}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#C91A09] hover:bg-[#b01607] text-[#F4F4F4] text-base font-black uppercase tracking-wider brick-btn flex items-center justify-center gap-2.5 shadow-[0_5px_0_#05131D] cursor-pointer"
          >
            <Hammer size={20} className="stroke-[2.5]" />
            <span>SANDBOX MODE</span>
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleStartRace}
              className="py-2 px-2.5 rounded-xl bg-white hover:bg-[#e8e8e8] border-2 border-[#05131D] text-[#05131D] text-xs font-bold brick-btn flex items-center justify-center gap-1.5 shadow-[0_3px_0_#05131D] cursor-pointer"
              title="Launch instant race with all 7 algorithms"
            >
              <Play size={13} className="text-[#0055BF] fill-current" />
              <span>Start Race</span>
            </button>

            <button
              onClick={handleOpenPresets}
              className="py-2 px-2.5 rounded-xl bg-white hover:bg-[#e8e8e8] border-2 border-[#05131D] text-[#05131D] text-xs font-bold brick-btn flex items-center justify-center gap-1.5 shadow-[0_3px_0_#05131D] cursor-pointer"
              title="Browse curated map presets"
            >
              <Map size={13} className="text-[#0055BF]" />
              <span>Map Presets</span>
            </button>

            <button
              onClick={handleOpenHelp}
              className="py-2 px-2.5 rounded-xl bg-white hover:bg-[#e8e8e8] border-2 border-[#05131D] text-[#05131D] text-xs font-bold brick-btn flex items-center justify-center gap-1.5 shadow-[0_3px_0_#05131D] cursor-pointer"
              title="Field manual and controls"
            >
              <BookOpen size={13} className="text-[#923978]" />
              <span>Rules</span>
            </button>
          </div>
        </div>

        {/* Audio & Settings Drawer */}
        <div className="flex flex-col gap-2 pt-2 border-t-2 border-[#05131D]/15">
          <div className="flex items-center justify-between text-xs text-[#595D60]">
            <button
              onClick={() => {
                setShowSettings((s) => !s);
                playClick();
              }}
              className="flex items-center gap-1.5 font-bold hover:text-[#05131D] transition-colors cursor-pointer"
            >
              <Sliders size={13} />
              <span>Audio Settings</span>
            </button>

            <span className="font-mono text-[10px] text-[#A3A2A4]">
              Press <kbd className="text-[#05131D] font-bold bg-[#05131D]/10 px-1 py-0.5 rounded border border-[#05131D]/20">Enter</kbd> to Launch
            </span>
          </div>

          {showSettings && (
            <div className="p-3 rounded-xl bg-white border-2 border-[#05131D] flex flex-col gap-2 shadow-[0_2px_0_#05131D]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5">
                  <Volume2 size={13} className="text-[#AA7F2E]" />
                  Volume: {Math.round(volume * 100)}%
                </span>
                <button
                  onClick={() => {
                    toggleSound();
                    playClick();
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border-2 border-[#05131D] transition-colors cursor-pointer flex items-center gap-1 ${
                    soundEnabled
                      ? 'bg-[#F2CD37] text-[#05131D]'
                      : 'bg-[#A3A2A4] text-[#05131D]'
                  }`}
                >
                  {soundEnabled ? <Volume2 size={11} /> : <VolumeX size={11} />}
                  <span>{soundEnabled ? 'SOUND ON' : 'MUTED'}</span>
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
                className="w-full accent-[#C91A09] cursor-pointer h-2 bg-[#A3A2A4]/40 rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
