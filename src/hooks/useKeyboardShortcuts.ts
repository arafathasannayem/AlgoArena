/**
 * Keyboard Shortcuts Hook — Global hotkey listener for game controls.
 *
 * Maps keypresses to store actions when no text input is focused:
 * - [Space]     : Start / Pause Race
 * - [R]         : Reset Race
 * - [.] / [→]   : Step 1 Tick
 * - [W]         : Wall Tool
 * - [C]         : High Cost Tool
 * - [E]         : Eraser Tool
 * - [S]         : Start Point Tool
 * - [G]         : Goal Point Tool
 * - [I]         : Isometric View
 * - [T]         : Top-Down 2D View
 * - [+] / [-]   : Zoom In / Out
 * - [?] / [H]   : Toggle Guide Modal
 *
 * @module hooks/useKeyboardShortcuts
 */

import { useEffect } from 'react';
import { useRaceStore } from '../state/raceStore';
import { useGridStore, type Tool } from '../state/gridStore';
import { useCameraStore } from '../state/cameraStore';
import { useAgentStore } from '../state/agentStore';
import { playClick, playStepTick } from '../utils/sound';

interface UseKeyboardShortcutsOptions {
  onToggleHelp?: () => void;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keystrokes when typing into form fields
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      switch (key) {
        case ' ': {
          e.preventDefault();
          const { status, startRace, pauseRace } = useRaceStore.getState();
          const agentsCount = useAgentStore.getState().agents.length;
          if (agentsCount === 0) return;

          if (status === 'running') {
            pauseRace();
          } else {
            startRace();
          }
          playClick();
          break;
        }

        case 'r': {
          e.preventDefault();
          useRaceStore.getState().resetRace();
          playClick();
          break;
        }

        case '.':
        case 'arrowright': {
          const { status, tick } = useRaceStore.getState();
          const agentsCount = useAgentStore.getState().agents.length;
          if (status !== 'running' && agentsCount > 0) {
            e.preventDefault();
            tick();
            playStepTick();
          }
          break;
        }

        case 'w':
        case 'c':
        case 'e':
        case 's':
        case 'g': {
          const { status } = useRaceStore.getState();
          if (status === 'running') break;

          const toolMap: Record<string, Tool> = {
            w: 'wall',
            c: 'cost',
            e: 'eraser',
            s: 'start',
            g: 'goal',
          };
          const selectedTool = toolMap[key];
          if (selectedTool) {
            e.preventDefault();
            useGridStore.getState().setActiveTool(selectedTool);
            playClick();
          }
          break;
        }

        case 'i': {
          e.preventDefault();
          useCameraStore.getState().triggerReset();
          playClick();
          break;
        }

        case 't': {
          e.preventDefault();
          useCameraStore.getState().triggerPreset('top');
          playClick();
          break;
        }

        case '+':
        case '=': {
          e.preventDefault();
          useCameraStore.getState().triggerZoomIn();
          playClick();
          break;
        }

        case '-':
        case '_': {
          e.preventDefault();
          useCameraStore.getState().triggerZoomOut();
          playClick();
          break;
        }

        case '?':
        case 'h': {
          e.preventDefault();
          options.onToggleHelp?.();
          playClick();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options]);
}
