/**
 * TopBar — Unified compact top command bar.
 *
 * Consolidates:
 * - Current map badge & inline grid size quick-selector (10×10, 20×20, 30×30)
 * - Tactile PAUSE [ESC] command button with live status pulse
 * - Camera controls (3D Isometric vs 2D Top-Down, zoom in/out)
 * - Audio mute toggle and field manual shortcut
 *
 * @module ui/TopBar
 */

import { useGridStore } from '../state/gridStore';
import { useRaceStore } from '../state/raceStore';
import { useCameraStore } from '../state/cameraStore';
import { useSoundStore } from '../state/soundStore';
import { useGameMenuStore } from '../state/gameMenuStore';
import { playClick } from '../utils/sound';
import {
  Pause,
  Play,
  Compass,
  Grid,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
  HelpCircle,
} from 'lucide-react';

const SIZES = [10, 20, 30] as const;

interface TopBarProps {
  onOpenHelp?: () => void;
}

export function TopBar({ onOpenHelp }: TopBarProps = {}) {
  const currentMapTitle = useGameMenuStore((s) => s.currentMapTitle);
  const openPauseMenu = useGameMenuStore((s) => s.openPauseMenu);

  const raceStatus = useRaceStore((s) => s.status);
  const isRunning = raceStatus === 'running';

  const width = useGridStore((s) => s.width);
  const setSize = useGridStore((s) => s.setSize);

  const isTopDown = useCameraStore((s) => s.isTopDown);
  const triggerResetCamera = useCameraStore((s) => s.triggerReset);
  const triggerTopDown = useCameraStore((s) => s.triggerPreset);
  const triggerZoomIn = useCameraStore((s) => s.triggerZoomIn);
  const triggerZoomOut = useCameraStore((s) => s.triggerZoomOut);

  const soundEnabled = useSoundStore((s) => s.enabled);
  const toggleSound = useSoundStore((s) => s.toggleSound);

  return (
    <header className="fixed top-3 inset-x-3 z-20 pointer-events-none flex items-center justify-between gap-2 select-none">
      {/* Left: Map Title & Grid Size Pills */}
      <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-3 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-xs font-bold text-white tracking-wide uppercase font-sans truncate max-w-[140px] sm:max-w-[200px]">
            {currentMapTitle}
          </span>
        </div>

        {/* Grid Size Selector (hidden during active race) */}
        {!isRunning && (
          <div className="flex items-center gap-1 pl-2 border-l border-white/10">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSize(s, s);
                  playClick();
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                  width === s
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title={`Change grid size to ${s}×${s}`}
              >
                {s}×{s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Center: Tactile Pause / Menu Pill */}
      <div className="pointer-events-auto">
        <button
          onClick={openPauseMenu}
          className={`group backdrop-blur-md border rounded-xl px-3.5 py-1.5 flex items-center gap-2 shadow-xl transition-all active:scale-95 ${
            isRunning
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
              : 'bg-slate-900/80 border-white/10 text-slate-200 hover:text-white hover:bg-white/10'
          }`}
          title="Pause Game [ESC]"
        >
          {/* Pulsing Status Pip */}
          <span
            className={`w-2 h-2 rounded-full ${
              isRunning
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-amber-400'
            }`}
          />

          <div className="flex items-center gap-1.5 font-bold text-xs tracking-wider uppercase font-mono">
            {isRunning ? <Pause size={12} /> : <Play size={12} className="opacity-80" />}
            <span>Pause</span>
          </div>

          <kbd className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-white/10 text-white/70 ml-0.5 group-hover:bg-white/20">
            ESC
          </kbd>
        </button>
      </div>

      {/* Right: Camera Presets, Zoom, Sound, and Manual */}
      <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl px-2 py-1 flex items-center gap-1 shadow-xl">
        {/* Camera Perspective: 3D Iso / 2D Top */}
        <div className="flex items-center bg-white/5 rounded-lg p-0.5 mr-1">
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
            title="Reset to Isometric 3D View [I]"
          >
            <Compass size={12} />
            <span className="hidden sm:inline">3D</span>
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
            title="Switch to Top-Down 2D View [T]"
          >
            <Grid size={12} />
            <span className="hidden sm:inline">2D</span>
          </button>
        </div>

        {/* Zoom Out */}
        <button
          onClick={() => {
            triggerZoomOut();
            playClick();
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Zoom Out [-]"
        >
          <ZoomOut size={13} />
        </button>

        {/* Zoom In */}
        <button
          onClick={() => {
            triggerZoomIn();
            playClick();
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Zoom In [+]"
        >
          <ZoomIn size={13} />
        </button>

        <span className="w-px h-3.5 bg-white/10 mx-0.5" />

        {/* Audio Mute Toggle */}
        <button
          onClick={() => {
            toggleSound();
            playClick();
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            soundEnabled
              ? 'text-amber-400 hover:text-amber-300 hover:bg-white/10'
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/10'
          }`}
          title={soundEnabled ? 'Audio Mute (Click to Silence)' : 'Audio Unmute (Click to Enable)'}
        >
          {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>

        {/* Help Manual */}
        {onOpenHelp && (
          <button
            onClick={() => {
              onOpenHelp();
              playClick();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Field Manual & Controls [?]"
          >
            <HelpCircle size={13} />
          </button>
        )}
      </div>
    </header>
  );
}
