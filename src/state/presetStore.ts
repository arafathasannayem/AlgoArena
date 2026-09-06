/**
 * Preset Store — Manages official and user-saved custom map presets.
 *
 * Persists player-designed maps to browser localStorage under 'algoarena_custom_presets'.
 * Provides full reactive CRUD and one-click arena loading.
 *
 * @module state/presetStore
 */

import { create } from 'zustand';
import type { MapPreset } from '../maps/presets';
import { PRESETS } from '../maps/presets';
import { useGridStore } from './gridStore';
import { useAgentStore } from './agentStore';
import { useRaceStore } from './raceStore';
import { playClick, playPlace } from '../utils/sound';

const STORAGE_KEY = 'algoarena_custom_presets';

export interface PresetState {
  /** User-created presets loaded from localStorage. */
  customPresets: MapPreset[];
  /** Load custom presets from localStorage. */
  loadStoredPresets: () => void;
  /** Save current grid layout as a new custom preset. */
  saveCurrentAsPreset: (name: string, description?: string) => MapPreset | null;
  /** Delete a saved custom preset by ID. */
  deleteCustomPreset: (id: string) => void;
  /** Load any preset (official or custom) directly into the arena. */
  loadPresetIntoArena: (preset: MapPreset) => void;
  /** Get all presets (official + custom). */
  getAllPresets: () => MapPreset[];
}

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== 'undefined' && localStorage) {
      return localStorage;
    }
    return null;
  } catch {
    return null;
  }
}

function readFromStorage(): MapPreset[] {
  try {
    const storage = getStorage();
    if (!storage) return [];
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

function writeToStorage(presets: MapPreset[]): void {
  try {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // Gracefully handle storage quota or private browsing exceptions
  }
}

export const usePresetStore = create<PresetState>((set, get) => ({
  customPresets: readFromStorage(),

  loadStoredPresets: () => {
    const stored = readFromStorage();
    set({ customPresets: stored });
  },

  saveCurrentAsPreset: (name: string, description?: string) => {
    const cleanName = name.trim();
    if (!cleanName) return null;

    const grid = useGridStore.getState();
    const walls: [number, number][] = [];
    for (const k of grid.walls) {
      const [x, y] = k.split(',').map(Number);
      if (typeof x === 'number' && typeof y === 'number') {
        walls.push([x, y]);
      }
    }

    const costs: [number, number, number][] = [];
    for (const [k, c] of grid.costs.entries()) {
      const [x, y] = k.split(',').map(Number);
      if (typeof x === 'number' && typeof y === 'number') {
        costs.push([x, y, c]);
      }
    }

    const goals = grid.goals.length > 1 ? grid.goals.map((g) => ({ ...g })) : undefined;

    const newPreset: MapPreset = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: cleanName,
      description: description?.trim() || `Custom ${grid.width}×${grid.height} layout created by player.`,
      width: grid.width,
      height: grid.height,
      walls,
      costs: costs.length > 0 ? costs : undefined,
      start: { ...grid.start },
      goal: { ...grid.goal },
      goals,
      category: 'custom',
      createdAt: Date.now(),
    };

    const updated = [newPreset, ...get().customPresets];
    writeToStorage(updated);
    set({ customPresets: updated });
    playPlace();
    return newPreset;
  },

  deleteCustomPreset: (id: string) => {
    const updated = get().customPresets.filter((p) => p.id !== id);
    writeToStorage(updated);
    set({ customPresets: updated });
    playClick();
  },

  loadPresetIntoArena: (preset: MapPreset) => {
    const gridStore = useGridStore.getState();
    gridStore.loadPreset(
      preset.walls,
      preset.start,
      preset.goal,
      preset.width,
      preset.height,
      preset.costs,
      preset.goals,
    );

    // Relocate all placed agents to new start tile
    useAgentStore.getState().resetAll(preset.start);

    // Reset race if it was in progress
    useRaceStore.getState().resetRace();

    playPlace();
  },

  getAllPresets: () => {
    const official = Object.values(PRESETS);
    const custom = get().customPresets;
    return [...official, ...custom];
  },
}));
