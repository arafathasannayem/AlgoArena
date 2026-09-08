/**
 * Unit tests for Theme Store.
 *
 * @module state/__tests__/themeStore.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore, THEMES } from '../themeStore';

describe('Theme Store', () => {
  beforeEach(() => {
    useThemeStore.getState().setTheme('classic');
  });

  it('should initialize with classic theme by default', () => {
    const state = useThemeStore.getState();
    expect(state.currentThemeId).toBe('classic');
    expect(state.currentTheme.baseplateColor).toBe('#237841');
    expect(state.currentTheme.wallColor).toBe('#582A12');
  });

  it('should switch between themes correctly', () => {
    const store = useThemeStore.getState();

    store.setTheme('space');
    expect(useThemeStore.getState().currentThemeId).toBe('space');
    expect(useThemeStore.getState().currentTheme.baseplateColor).toBe('#0B132B');

    store.setTheme('castle');
    expect(useThemeStore.getState().currentThemeId).toBe('castle');
    expect(useThemeStore.getState().currentTheme.baseplateColor).toBe('#5A6268');

    store.setTheme('city');
    expect(useThemeStore.getState().currentThemeId).toBe('city');
    expect(useThemeStore.getState().currentTheme.baseplateColor).toBe('#33373B');
  });

  it('should ignore invalid theme IDs', () => {
    const store = useThemeStore.getState();
    store.setTheme('space');
    // @ts-expect-error testing invalid ID
    store.setTheme('nonexistent');
    expect(useThemeStore.getState().currentThemeId).toBe('space');
  });

  it('should provide all four required themes', () => {
    expect(Object.keys(THEMES)).toEqual(['classic', 'castle', 'space', 'city']);
  });
});
