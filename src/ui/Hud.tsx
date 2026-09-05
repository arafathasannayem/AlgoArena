/**
 * Hud — Glassmorphism HUD overlay compositing all floating UI panels.
 *
 * Implements the layout guidelines from init.md §6:
 * - Floating edge-anchored panels (minimalist, never full-width bars)
 * - Translucent backdrop-blur glass styling
 * - High-contrast sans-serif typography
 * - Never obscures the center diorama board at default viewport sizes
 * - Full integration with Start Menu launcher, Preset Chooser, and Custom Presets
 *
 * @module ui/Hud
 */

import { useState } from 'react';
import { AgentPanel } from './AgentPanel';
import { Leaderboard } from './Leaderboard';
import { GridSizeControl } from './GridSizeControl';
import { ToolPalette } from './ToolPalette';
import { SpeedSlider } from './SpeedSlider';
import { ResultsDashboard } from './ResultsDashboard';
import { CameraControls } from './CameraControls';
import { HelpModal } from './HelpModal';
import { StartMenu } from './StartMenu';
import { PresetChooserModal } from './PresetChooserModal';
import { SavePresetModal } from './SavePresetModal';
import { useGameMenuStore } from '../state/gameMenuStore';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { Menu } from 'lucide-react';

export function Hud() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const isStartMenuOpen = useGameMenuStore((s) => s.isStartMenuOpen);
  const openStartMenu = useGameMenuStore((s) => s.openStartMenu);

  useKeyboardShortcuts({
    onToggleHelp: () => setIsHelpOpen((prev) => !prev),
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden font-sans">
      {/* Interactive HUD panels with pointer-events-auto */}
      <div className="pointer-events-auto">
        {/* Game Title Screen / Start Menu */}
        <StartMenu onOpenHelp={() => setIsHelpOpen(true)} />

        {/* Preset Chooser Modal */}
        <PresetChooserModal />

        {/* Save Preset Modal */}
        <SavePresetModal />

        {/* Arena gameplay HUD (active when start menu is dismissed) */}
        {!isStartMenuOpen && (
          <>
            {/* Top-center minimal Menu button to return to launcher */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10">
              <button
                onClick={openStartMenu}
                className="bg-glass-bg backdrop-blur-md border border-glass-border hover:border-white/20 rounded-panel px-3 py-1.5 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 shadow-lg transition-colors"
                title="Return to Main Menu [M]"
              >
                <Menu size={13} />
                <span className="font-semibold tracking-wide text-[11px] uppercase">Menu</span>
                <kbd className="text-[9px] font-mono opacity-50 bg-white/10 px-1 py-0.2 rounded ml-0.5">M</kbd>
              </button>
            </div>

            <AgentPanel />
            <Leaderboard />
            <GridSizeControl />
            <ToolPalette onOpenHelp={() => setIsHelpOpen(true)} />
            <SpeedSlider />
            <CameraControls />
            <ResultsDashboard />
          </>
        )}

        {/* Global Reference Guide Modal */}
        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </div>
    </div>
  );
}
