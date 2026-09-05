/**
 * CameraControls — Floating glassmorphic camera navigation toolbar.
 *
 * Positioned in the bottom-right of the viewport:
 * - Zoom In / Zoom Out buttons
 * - True Isometric view reset
 * - Top-Down 2D overhead view preset
 *
 * @module ui/CameraControls
 */

import { useCameraStore } from '../state/cameraStore';
import { playClick } from '../utils/sound';
import { ZoomIn, ZoomOut, Compass, Grid } from 'lucide-react';

export function CameraControls() {
  const triggerZoomIn = useCameraStore((s) => s.triggerZoomIn);
  const triggerZoomOut = useCameraStore((s) => s.triggerZoomOut);
  const triggerReset = useCameraStore((s) => s.triggerReset);
  const triggerPreset = useCameraStore((s) => s.triggerPreset);

  const isTopDown = useCameraStore((s) => s.isTopDown);

  const handleZoomIn = () => {
    triggerZoomIn();
    playClick();
  };

  const handleZoomOut = () => {
    triggerZoomOut();
    playClick();
  };

  const handleReset = () => {
    triggerReset();
    playClick();
  };

  const handleTopDown = () => {
    triggerPreset('top');
    playClick();
  };

  return (
    <div className="fixed bottom-6 right-6 bg-glass-bg backdrop-blur-md border border-glass-border rounded-panel p-1.5 flex flex-col gap-1 z-10 text-glass-text shadow-xl">
      {/* Zoom In */}
      <button
        onClick={handleZoomIn}
        className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/15 active:bg-white/25 transition-colors"
        title="Zoom In [+]"
        aria-label="Zoom In"
      >
        <ZoomIn size={16} />
      </button>

      {/* Zoom Out */}
      <button
        onClick={handleZoomOut}
        className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/15 active:bg-white/25 transition-colors"
        title="Zoom Out [-]"
        aria-label="Zoom Out"
      >
        <ZoomOut size={16} />
      </button>

      <div className="w-full h-px bg-white/10 my-0.5" />

      {/* Reset to Isometric */}
      <button
        onClick={handleReset}
        className={`p-2 rounded-lg transition-colors ${
          !isTopDown
            ? 'bg-white/20 text-white shadow-sm'
            : 'text-white/60 hover:text-white hover:bg-white/15'
        }`}
        title="Reset to Isometric View [I]"
        aria-label="Reset to Isometric View"
      >
        <Compass size={16} />
      </button>

      {/* Top-Down View */}
      <button
        onClick={handleTopDown}
        className={`p-2 rounded-lg transition-colors ${
          isTopDown
            ? 'bg-white/20 text-white shadow-sm'
            : 'text-white/60 hover:text-white hover:bg-white/15'
        }`}
        title="Top-Down 2D View [T]"
        aria-label="Top-Down View"
      >
        <Grid size={16} />
      </button>
    </div>
  );
}
