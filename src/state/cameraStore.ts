/**
 * Camera Store — Zustand store for managing 3D camera actions and zoom states.
 *
 * Provides a bridge between UI controls (zoom in/out, view reset, view presets)
 * and the 3D scene camera controller.
 *
 * @module state/cameraStore
 */

import { create } from 'zustand';

export type CameraViewPreset = 'iso' | 'top';

export interface CameraState {
  zoomAction: 'in' | 'out' | 'reset' | CameraViewPreset | null;
  zoomLevel: number;

  triggerZoomIn: () => void;
  triggerZoomOut: () => void;
  triggerReset: () => void;
  triggerPreset: (preset: CameraViewPreset) => void;
  clearAction: () => void;
  setZoomLevel: (zoom: number) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  zoomAction: null,
  zoomLevel: 40,

  triggerZoomIn: () => set({ zoomAction: 'in' }),
  triggerZoomOut: () => set({ zoomAction: 'out' }),
  triggerReset: () => set({ zoomAction: 'reset' }),
  triggerPreset: (preset) => set({ zoomAction: preset }),
  clearAction: () => set({ zoomAction: null }),
  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
}));
