/**
 * Unit tests for Preset Store.
 *
 * Tests custom preset persistence (localStorage), creation, deletion,
 * and loading into gridStore.
 *
 * @module state/__tests__/presetStore.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePresetStore } from '../presetStore';
import { useGridStore } from '../gridStore';
import { PRESETS } from '../../maps/presets';

const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

describe('Preset Store', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', storageMock);
    storageMock.clear();
    usePresetStore.setState({ customPresets: [] });
    useGridStore.getState().setSize(10, 10);
    useGridStore.getState().clearGrid();
  });

  it('should initialize with empty custom presets when storage is clear', () => {
    expect(usePresetStore.getState().customPresets).toEqual([]);
  });

  it('should save current grid state as a custom preset', () => {
    const grid = useGridStore.getState();
    grid.paintWall(2, 3);
    grid.paintWall(4, 5);
    grid.paintCost(6, 7, 8);

    const preset = usePresetStore.getState().saveCurrentAsPreset('Test Arena', 'A custom test map');
    expect(preset).not.toBeNull();
    expect(preset?.name).toBe('Test Arena');
    expect(preset?.description).toBe('A custom test map');
    expect(preset?.walls).toHaveLength(2);
    expect(preset?.costs).toHaveLength(1);
    expect(preset?.category).toBe('custom');

    const state = usePresetStore.getState();
    expect(state.customPresets).toHaveLength(1);
    expect(state.customPresets[0]?.name).toBe('Test Arena');

    // Check localStorage persistence
    const raw = localStorage.getItem('algoarena_custom_presets');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe('Test Arena');
  });

  it('should not save preset with empty name', () => {
    const preset = usePresetStore.getState().saveCurrentAsPreset('   ');
    expect(preset).toBeNull();
    expect(usePresetStore.getState().customPresets).toHaveLength(0);
  });

  it('should delete a custom preset by ID', () => {
    const grid = useGridStore.getState();
    grid.paintWall(1, 1);
    const p1 = usePresetStore.getState().saveCurrentAsPreset('Map 1')!;
    const p2 = usePresetStore.getState().saveCurrentAsPreset('Map 2')!;

    expect(usePresetStore.getState().customPresets).toHaveLength(2);

    usePresetStore.getState().deleteCustomPreset(p1.id!);
    const state = usePresetStore.getState();
    expect(state.customPresets).toHaveLength(1);
    expect(state.customPresets[0]?.id).toBe(p2.id);
    expect(state.customPresets[0]?.name).toBe('Map 2');

    const raw = localStorage.getItem('algoarena_custom_presets');
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe('Map 2');
  });

  it('should load preset into arena correctly', () => {
    const oasis = PRESETS['oasis']!;
    usePresetStore.getState().loadPresetIntoArena(oasis);

    const grid = useGridStore.getState();
    expect(grid.width).toBe(20);
    expect(grid.height).toBe(20);
    expect(grid.start).toEqual(oasis.start);
    expect(grid.goal).toEqual(oasis.goal);
    expect(grid.walls.size).toBe(oasis.walls.length);
    expect(grid.costs.size).toBe(oasis.costs?.length ?? 0);
  });

  it('should return all presets combining curated and custom', () => {
    usePresetStore.getState().saveCurrentAsPreset('My Custom Map');
    const all = usePresetStore.getState().getAllPresets();
    const officialCount = Object.keys(PRESETS).length;
    expect(all).toHaveLength(officialCount + 1);
  });
});
