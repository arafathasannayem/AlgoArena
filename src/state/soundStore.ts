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
  toggleSound: () => void;
  setEnabled: (enabled: boolean) => void;
}

const STORAGE_KEY = 'algoarena_sound_enabled';

export const useSoundStore = create<SoundState>((set) => ({
  enabled: typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true',

  toggleSound: () =>
    set((state) => {
      const next = !state.enabled;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, String(next));
      }
      return { enabled: next };
    }),

  setEnabled: (enabled) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    }
    set({ enabled });
  },
}));
