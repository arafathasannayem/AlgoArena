/**
 * Sound Store — Zustand store for game audio settings.
 *
 * Manages audio mute/unmute state with local storage persistence.
 *
 * @module state/soundStore
 */

import { create } from 'zustand';

export interface SoundState {
  enabled: boolean;
  volume: number;
  toggleSound: () => void;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
}

const STORAGE_KEY_ENABLED = 'algoarena_sound_enabled';
const STORAGE_KEY_VOLUME = 'algoarena_sound_volume';

function getStoredVolume(): number {
  if (typeof window === 'undefined') return 0.75;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VOLUME);
    if (raw !== null) {
      const parsed = parseFloat(raw);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        return parsed;
      }
    }
  } catch {
    // Ignore localStorage access errors
  }
  return 0.75;
}

export const useSoundStore = create<SoundState>((set) => ({
  enabled: typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY_ENABLED) !== 'false',
  volume: getStoredVolume(),

  toggleSound: () =>
    set((state) => {
      const next = !state.enabled;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_ENABLED, String(next));
        } catch {
          // Ignore
        }
      }
      return { enabled: next };
    }),

  setEnabled: (enabled) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_ENABLED, String(enabled));
      } catch {
        // Ignore
      }
    }
    set({ enabled });
  },

  setVolume: (volume) => {
    const clamped = Math.max(0, Math.min(1, volume));
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_VOLUME, String(clamped));
      } catch {
        // Ignore
      }
    }
    set({ volume: clamped });
  },
}));
