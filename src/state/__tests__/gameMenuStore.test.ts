/**
 * Unit tests for Game Menu Store.
 *
 * @module state/__tests__/gameMenuStore.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameMenuStore } from '../gameMenuStore';
import { useRaceStore } from '../raceStore';
import { useAgentStore } from '../agentStore';

describe('Game Menu Store', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(Date.now()), 16) as unknown as number;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      clearTimeout(id);
    });

    useGameMenuStore.setState({
      isTitleScreenOpen: true,
      isStartMenuOpen: true,
      isPauseMenuOpen: false,
      wasRunningBeforePause: false,
      currentMapTitle: 'Open Desert Sandbox',
      isPresetChooserOpen: false,
      isSavePresetOpen: false,
    });
    useRaceStore.getState().resetRace();
    useAgentStore.getState().clearAgents();
  });

  afterEach(() => {
    useRaceStore.getState().resetRace();
    vi.unstubAllGlobals();
  });

  it('should initialize with title screen open and pause menu closed', () => {
    const state = useGameMenuStore.getState();
    expect(state.isTitleScreenOpen).toBe(true);
    expect(state.isPauseMenuOpen).toBe(false);
    expect(state.currentMapTitle).toBe('Open Desert Sandbox');
  });

  it('should toggle title screen open and closed', () => {
    const store = useGameMenuStore.getState();
    store.closeTitleScreen();
    expect(useGameMenuStore.getState().isTitleScreenOpen).toBe(false);

    store.openTitleScreen();
    expect(useGameMenuStore.getState().isTitleScreenOpen).toBe(true);
  });

  it('should open and close pause menu when idle', () => {
    const store = useGameMenuStore.getState();
    store.openPauseMenu();
    expect(useGameMenuStore.getState().isPauseMenuOpen).toBe(true);
    expect(useGameMenuStore.getState().wasRunningBeforePause).toBe(false);

    store.closePauseMenu();
    expect(useGameMenuStore.getState().isPauseMenuOpen).toBe(false);
  });

  it('should pause running race when opening pause menu and resume when closing', () => {
    // Add an agent so raceStore has active generators
    useAgentStore.getState().addAgent('astar', '#3b82f6', { x: 0, y: 0 });
    useRaceStore.getState().startRace();
    expect(useRaceStore.getState().status).toBe('running');

    const store = useGameMenuStore.getState();
    store.openPauseMenu();

    expect(useGameMenuStore.getState().isPauseMenuOpen).toBe(true);
    expect(useGameMenuStore.getState().wasRunningBeforePause).toBe(true);
    expect(useRaceStore.getState().status).toBe('idle');

    store.closePauseMenu();
    expect(useGameMenuStore.getState().isPauseMenuOpen).toBe(false);
    expect(useRaceStore.getState().status).toBe('running');
  });

  it('should toggle pause menu state cleanly', () => {
    const store = useGameMenuStore.getState();
    store.togglePauseMenu();
    expect(useGameMenuStore.getState().isPauseMenuOpen).toBe(true);

    store.togglePauseMenu();
    expect(useGameMenuStore.getState().isPauseMenuOpen).toBe(false);
  });

  it('should update current map title', () => {
    const store = useGameMenuStore.getState();
    store.setCurrentMapTitle('The Desert Oasis');
    expect(useGameMenuStore.getState().currentMapTitle).toBe('The Desert Oasis');
  });

  it('should open and close modals', () => {
    const store = useGameMenuStore.getState();
    store.openPresetChooser();
    expect(useGameMenuStore.getState().isPresetChooserOpen).toBe(true);
    store.closePresetChooser();
    expect(useGameMenuStore.getState().isPresetChooserOpen).toBe(false);

    store.openSavePreset();
    expect(useGameMenuStore.getState().isSavePresetOpen).toBe(true);
    store.closeSavePreset();
    expect(useGameMenuStore.getState().isSavePresetOpen).toBe(false);
  });
});
