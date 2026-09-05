/**
 * App — Root component for Algorithm Arena.
 *
 * Composites the 3D isometric diorama scene with the glassmorphism HUD overlay.
 */

import { Diorama } from './scene/Diorama';
import { Hud } from './ui/Hud';

export function App() {
  return (
    <main className="h-screen w-screen bg-board-base overflow-hidden relative select-none">
      {/* 3D isometric diorama scene (full viewport) */}
      <Diorama />

      {/* Floating glassmorphic HUD overlay */}
      <Hud />
    </main>
  );
}
