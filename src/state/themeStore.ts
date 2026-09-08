/**
 * Theme Store — Zustand store for Brick Racer diorama themes.
 *
 * Manages the active board skin (Classic, Castle, Space, City).
 * Theme changes update baseplate tint and wall brick colors while
 * keeping algorithm colors and semantic states strictly consistent.
 *
 * @module state/themeStore
 */

import { create } from 'zustand';

export type BoardThemeId = 'classic' | 'castle' | 'space' | 'city';

export interface BoardThemeConfig {
  id: BoardThemeId;
  label: string;
  tagline: string;
  baseplateColor: string;
  studColor: string;
  wallColor: string;
  wallAltColor: string;
  pedestalColor: string;
  roughCostColor: string;
}

export const THEMES: Record<BoardThemeId, BoardThemeConfig> = {
  classic: {
    id: 'classic',
    label: 'Classic Baseplate',
    tagline: 'Green stud baseplate + reddish-brown bricks',
    baseplateColor: '#237841',
    studColor: '#1c6837',
    wallColor: '#582A12',
    wallAltColor: '#6e3618',
    pedestalColor: '#595D60',
    roughCostColor: '#3a2010',
  },
  castle: {
    id: 'castle',
    label: 'Castle Keep',
    tagline: 'Stone grey cobblestone + dark fortress blocks',
    baseplateColor: '#5A6268',
    studColor: '#4b5257',
    wallColor: '#2B2D2F',
    wallAltColor: '#3e4246',
    pedestalColor: '#343A40',
    roughCostColor: '#1c1e20',
  },
  space: {
    id: 'space',
    label: 'Space Station',
    tagline: 'Deep navy floor + neon trans-cyan barriers',
    baseplateColor: '#0B132B',
    studColor: '#111d42',
    wallColor: '#00F5D4',
    wallAltColor: '#00c4aa',
    pedestalColor: '#1C2541',
    roughCostColor: '#050a17',
  },
  city: {
    id: 'city',
    label: 'City Construction',
    tagline: 'Asphalt roadway + tan/orange masonry blocks',
    baseplateColor: '#33373B',
    studColor: '#282c30',
    wallColor: '#D48037',
    wallAltColor: '#be712f',
    pedestalColor: '#495057',
    roughCostColor: '#24272a',
  },
};

const THEME_STORAGE_KEY = 'algoarena_board_theme';

function getInitialTheme(): BoardThemeId {
  if (typeof window === 'undefined') return 'classic';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && saved in THEMES) {
      return saved as BoardThemeId;
    }
  } catch {
    // Ignore localStorage access errors
  }
  return 'classic';
}

export interface ThemeState {
  currentThemeId: BoardThemeId;
  currentTheme: BoardThemeConfig;
  setTheme: (id: BoardThemeId) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  currentThemeId: getInitialTheme(),
  currentTheme: THEMES[getInitialTheme()],
  setTheme: (id: BoardThemeId) => {
    if (!THEMES[id]) return;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      // Ignore localStorage write errors
    }
    set({
      currentThemeId: id,
      currentTheme: THEMES[id],
    });
  },
}));
