/**
 * App — Root component for Algorithm Arena.
 *
 * Layers the 3D diorama scene beneath floating glass HUD panels.
 */

import { Diorama } from './scene/Diorama';
import { ToolPalette } from './ui/ToolPalette';
import { GridSizeControl } from './ui/GridSizeControl';
import { AgentPanel } from './ui/AgentPanel';
import { SpeedSlider } from './ui/SpeedSlider';

export function App() {
  return (
    <div className="h-screen w-screen bg-board-base overflow-hidden relative">
      {/* 3D isometric diorama scene (full viewport) */}
      <Diorama />

      {/* Floating glass HUD panels */}
      <AgentPanel />
      <ToolPalette />
      <GridSizeControl />
      <SpeedSlider />
    </div>
  );
}
