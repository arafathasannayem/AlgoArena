/**
 * Hud — Glassmorphism HUD overlay compositing all floating UI panels.
 *
 * Implements the layout guidelines from init.md §6:
 * - Floating edge-anchored panels (minimalist, never full-width bars)
 * - Translucent backdrop-blur glass styling
 * - High-contrast sans-serif typography
 * - Never obscures the center diorama board at default viewport sizes
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
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export function Hud() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useKeyboardShortcuts({
    onToggleHelp: () => setIsHelpOpen((prev) => !prev),
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden font-sans">
      {/* Interactive HUD panels with pointer-events-auto */}
      <div className="pointer-events-auto">
        <AgentPanel />
        <Leaderboard />
        <GridSizeControl />
        <ToolPalette onOpenHelp={() => setIsHelpOpen(true)} />
        <SpeedSlider />
        <CameraControls />
        <ResultsDashboard />
        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </div>
    </div>
  );
}
