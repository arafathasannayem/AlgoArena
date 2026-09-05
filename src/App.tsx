/**
 * App — Root component for Algorithm Arena.
 *
 * Composes the grid view with floating HUD panels. In Phase 2 the grid is
 * rendered as 2D divs; Phase 3 replaces GridView with the 3D Diorama.
 */

import { GridView } from './ui/GridView';
import { ToolPalette } from './ui/ToolPalette';
import { GridSizeControl } from './ui/GridSizeControl';

export function App() {
  return (
    <div className="h-screen w-screen bg-board-base flex items-center justify-center overflow-hidden">
      <GridView />
      <ToolPalette />
      <GridSizeControl />
    </div>
  );
}
