/**
 * App — Root component for Algorithm Arena.
 *
 * Currently renders a placeholder canvas. The 3D diorama scene and HUD overlay
 * will be layered here in later phases (Phase 2+).
 */
export function App() {
  return (
    <div className="h-screen w-screen bg-board-base flex items-center justify-center">
      <h1 className="text-2xl font-bold text-glass-text bg-glass-bg px-6 py-4 rounded-panel backdrop-blur-md border border-glass-border">
        Algorithm Arena
      </h1>
    </div>
  );
}
