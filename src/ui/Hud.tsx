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
import { TopBar } from './TopBar';
import { ToolDock } from './ToolDock';
import { RacerDock } from './RacerDock';
import { BottomConsole } from './BottomConsole';
import { ResultsDashboard } from './ResultsDashboard';
import { HelpModal } from './HelpModal';
import { TitleScreen } from './TitleScreen';
import { PauseMenu } from './PauseMenu';
import { PresetChooserModal } from './PresetChooserModal';
import { SavePresetModal } from './SavePresetModal';
import { useGameMenuStore } from '../state/gameMenuStore';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export function Hud() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const isTitleScreenOpen = useGameMenuStore((s) => s.isTitleScreenOpen);

  useKeyboardShortcuts({
    onToggleHelp: () => setIsHelpOpen((prev) => !prev),
    isHelpOpen,
    onCloseHelp: () => setIsHelpOpen(false),
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden font-sans">
      <div className="pointer-events-auto">
        {/* Title Launcher Screen */}
        <TitleScreen onOpenHelp={() => setIsHelpOpen(true)} />

        {/* In-Game Tactical Pause Menu Overlay */}
        <PauseMenu onOpenHelp={() => setIsHelpOpen(true)} />

        {/* Preset Chooser Screen */}
        <PresetChooserModal />

        {/* Save Preset Modal */}
        <SavePresetModal />

        {/* In-Game Tactical HUD (rendered when title screen is dismissed) */}
        {!isTitleScreenOpen && (
          <>
            <TopBar onOpenHelp={() => setIsHelpOpen(true)} />
            <ToolDock />
            <RacerDock />
            <BottomConsole />
            <ResultsDashboard />
          </>
        )}

        {/* Global Reference Guide Modal */}
        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </div>
    </div>
  );
}
