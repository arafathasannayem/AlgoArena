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
import { playClick, playPause, playResume } from '../utils/sound';
import { useRaceStore } from './raceStore';

export interface GameMenuState {
  isTitleScreenOpen: boolean;
  isPauseMenuOpen: boolean;
  wasRunningBeforePause: boolean;
  currentMapTitle: string;
  isPresetChooserOpen: boolean;
  isSavePresetOpen: boolean;

  // Title Screen actions
  openTitleScreen: () => void;
  closeTitleScreen: () => void;

  // Pause Menu actions
  openPauseMenu: () => void;
  closePauseMenu: () => void;
  togglePauseMenu: () => void;

  // Presets & Save modals
  openPresetChooser: () => void;
  closePresetChooser: () => void;
  openSavePreset: () => void;
  closeSavePreset: () => void;

  // Map metadata
  setCurrentMapTitle: (title: string) => void;

  // Backwards compatibility aliases
  isStartMenuOpen: boolean;
  openStartMenu: () => void;
  closeStartMenu: () => void;
  toggleStartMenu: () => void;
}

export const useGameMenuStore = create<GameMenuState>((set, get) => ({
  isTitleScreenOpen: true,
  isStartMenuOpen: true,
  isPauseMenuOpen: false,
  wasRunningBeforePause: false,
  currentMapTitle: 'Open Desert Sandbox',
  isPresetChooserOpen: false,
  isSavePresetOpen: false,

  openTitleScreen: () => {
    const raceState = useRaceStore.getState();
    if (raceState.status === 'running') {
      raceState.pauseRace();
    }
    set({
      isTitleScreenOpen: true,
      isStartMenuOpen: true,
      isPauseMenuOpen: false,
      isPresetChooserOpen: false,
      isSavePresetOpen: false,
      wasRunningBeforePause: false,
    });
    playClick();
  },

  closeTitleScreen: () => {
    set({
      isTitleScreenOpen: false,
      isStartMenuOpen: false,
    });
    playClick();
  },

  openPauseMenu: () => {
    const isRunning = useRaceStore.getState().status === 'running';
    if (isRunning) {
      useRaceStore.getState().pauseRace();
    }
    set({
      isPauseMenuOpen: true,
      wasRunningBeforePause: isRunning,
      isPresetChooserOpen: false,
      isSavePresetOpen: false,
    });
    playPause();
  },

  closePauseMenu: () => {
    const wasRunning = get().wasRunningBeforePause;
    if (wasRunning) {
      useRaceStore.getState().resumeRace();
    }
    set({
      isPauseMenuOpen: false,
      wasRunningBeforePause: false,
    });
    playResume();
  },

  togglePauseMenu: () => {
    if (get().isPauseMenuOpen) {
      get().closePauseMenu();
    } else {
      get().openPauseMenu();
    }
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

  setCurrentMapTitle: (title: string) => {
    set({ currentMapTitle: title });
  },

  // Backwards compatibility aliases
  openStartMenu: () => get().openTitleScreen(),
  closeStartMenu: () => get().closeTitleScreen(),
  toggleStartMenu: () => {
    if (get().isTitleScreenOpen) {
      get().closeTitleScreen();
    } else {
      get().openTitleScreen();
    }
  },
}));
