/**
 * Unit tests for Camera Store.
 *
 * @module state/__tests__/cameraStore.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useCameraStore } from '../cameraStore';

describe('Camera Store', () => {
  beforeEach(() => {
    useCameraStore.getState().clearAction();
  });

  it('should initialize with null zoomAction', () => {
    const state = useCameraStore.getState();
    expect(state.zoomAction).toBeNull();
  });

  it('should trigger zoom in and out actions', () => {
    const store = useCameraStore.getState();
    store.triggerZoomIn();
    expect(useCameraStore.getState().zoomAction).toBe('in');

    store.triggerZoomOut();
    expect(useCameraStore.getState().zoomAction).toBe('out');
  });

  it('should trigger reset action', () => {
    const store = useCameraStore.getState();
    store.triggerReset();
    expect(useCameraStore.getState().zoomAction).toBe('reset');
  });

  it('should trigger view presets', () => {
    const store = useCameraStore.getState();
    store.triggerPreset('top');
    expect(useCameraStore.getState().zoomAction).toBe('top');

    store.triggerPreset('iso');
    expect(useCameraStore.getState().zoomAction).toBe('iso');
  });

  it('should clear actions', () => {
    const store = useCameraStore.getState();
    store.triggerZoomIn();
    expect(useCameraStore.getState().zoomAction).toBe('in');

    store.clearAction();
    expect(useCameraStore.getState().zoomAction).toBeNull();
  });

  it('should manage isTopDown flag correctly for 2D top-down mode', () => {
    const store = useCameraStore.getState();
    expect(store.isTopDown).toBe(false);

    store.triggerPreset('top');
    expect(useCameraStore.getState().isTopDown).toBe(true);

    store.triggerPreset('iso');
    expect(useCameraStore.getState().isTopDown).toBe(false);

    store.triggerPreset('top');
    expect(useCameraStore.getState().isTopDown).toBe(true);
    store.triggerReset();
    expect(useCameraStore.getState().isTopDown).toBe(false);

    store.setIsTopDown(true);
    expect(useCameraStore.getState().isTopDown).toBe(true);
  });
});
