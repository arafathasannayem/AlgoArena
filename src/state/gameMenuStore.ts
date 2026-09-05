/**
 * Game Menu Store — Orchestrates top-level navigation states.
 *
 * Manages visibility for:
 * - Start Menu (Title / Game Launcher screen)
 * - Preset Chooser Screen (Map selection browser)
 * - Save Preset Modal (Custom map creator)
 *
 * @module state/gameMenuStore
 */

import { create } from 'zustand';
import { playClick } from '../utils/sound';

export interface GameMenuState {
  isStartMenuOpen: boolean;
  isPresetChooserOpen: boolean;
  isSavePresetOpen: boolean;

  openStartMenu: () => void;
  closeStartMenu: () => void;
  toggleStartMenu: () => void;

  openPresetChooser: () => void;
  closePresetChooser: () => void;

  openSavePreset: () => void;
  closeSavePreset: () => void;
}

export const useGameMenuStore = create<GameMenuState>((set) => ({
  isStartMenuOpen: true,
  isPresetChooserOpen: false,
  isSavePresetOpen: false,

  openStartMenu: () => {
    set({ isStartMenuOpen: true, isPresetChooserOpen: false, isSavePresetOpen: false });
    playClick();
  },
  closeStartMenu: () => {
    set({ isStartMenuOpen: false });
    playClick();
  },
  toggleStartMenu: () => {
    set((s) => ({ isStartMenuOpen: !s.isStartMenuOpen }));
    playClick();
  },

  openPresetChooser: () => {
    set({ isPresetChooserOpen: true });
    playClick();
  },
  closePresetChooser: () => {
    set({ isPresetChooserOpen: false });
    playClick();
  },

  openSavePreset: () => {
    set({ isSavePresetOpen: true });
    playClick();
  },
  closeSavePreset: () => {
    set({ isSavePresetOpen: false });
    playClick();
  },
}));
