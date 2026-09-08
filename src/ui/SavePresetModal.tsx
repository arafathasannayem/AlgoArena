/**
 * SavePresetModal — Dialog for naming and saving current grid to localStorage.
 *
 * Captures the active grid dimensions, placed walls, rough terrain costs,
 * start point, and goal coordinates.
 *
 * @module ui/SavePresetModal
 */

import { useState, useEffect, useMemo } from 'react';
import { useGridStore } from '../state/gridStore';
import { usePresetStore } from '../state/presetStore';
import { useGameMenuStore } from '../state/gameMenuStore';
import { MiniMapPreview } from './MiniMapPreview';
import { playClick } from '../utils/sound';
import { X, Save, BookmarkCheck } from 'lucide-react';
import type { MapPreset } from '../maps/presets';

export function SavePresetModal() {
  const isOpen = useGameMenuStore((s) => s.isSavePresetOpen);
  if (!isOpen) return null;
  return <SavePresetContent />;
}

function SavePresetContent() {
  const closeSavePreset = useGameMenuStore((s) => s.closeSavePreset);
  const saveCurrentAsPreset = usePresetStore((s) => s.saveCurrentAsPreset);

  const width = useGridStore((s) => s.width);
  const height = useGridStore((s) => s.height);
  const walls = useGridStore((s) => s.walls);
  const costs = useGridStore((s) => s.costs);
  const start = useGridStore((s) => s.start);
  const goals = useGridStore((s) => s.goals);

  const [name, setName] = useState(() => `Custom Map ${new Date().toLocaleDateString()}`);
  const [description, setDescription] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Keyboard close on Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSavePreset();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeSavePreset]);

  // Build live preview preset object
  const previewPreset = useMemo<MapPreset>(() => {
    const wallArr: [number, number][] = [];
    for (const k of walls) {
      const [x, y] = k.split(',').map(Number);
      if (typeof x === 'number' && typeof y === 'number') wallArr.push([x, y]);
    }
    const costArr: [number, number, number][] = [];
    for (const [k, c] of costs.entries()) {
      const [x, y] = k.split(',').map(Number);
      if (typeof x === 'number' && typeof y === 'number') costArr.push([x, y, c]);
    }

    return {
      name: name || 'Preview',
      description: description || 'Current board setup',
      width,
      height,
      walls: wallArr,
      costs: costArr.length > 0 ? costArr : undefined,
      start,
      goal: goals[0]!,
      goals: goals.length > 1 ? goals.map((g) => ({ ...g })) : undefined,
      category: 'custom',
    };
  }, [width, height, walls, costs, start, goals, name, description]);


  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const saved = saveCurrentAsPreset(name, description);
    if (saved) {
      setSavedSuccess(true);
      setTimeout(() => {
        closeSavePreset();
      }, 700);
    }
  };

  return (
    <div
      onClick={closeSavePreset}
      className="fixed inset-0 bg-black/65 backdrop-blur-md z-[130] flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900/95 border border-white/10 rounded-2xl p-6 max-w-md w-full text-slate-200 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Save size={18} className="text-blue-400" />
            <h3 className="text-base font-semibold text-white">Save Custom Map Preset</h3>
          </div>
          <button
            onClick={() => {
              closeSavePreset();
              playClick();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Cancel [Esc]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Preview & Stats Summary */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
          <MiniMapPreview preset={previewPreset} size={84} />
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-semibold text-white">{width}×{height} Grid</span>
            <span className="text-slate-400">{walls.size} obstacle walls</span>
            <span className="text-slate-400">{costs.size} rough terrain tiles</span>
            <span className="text-slate-500 font-mono text-[10px]">
              Start: ({start.x}, {start.y}) • Goal: ({goals[0]!.x}, {goals[0]!.y})
              {goals.length > 1 && <span> (+{goals.length - 1} more)</span>}
            </span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">Preset Name</label>
            <input
              type="text"
              required
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Desert Citadel, Zigzag Run"
              className="bg-slate-950/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">
              Description <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              maxLength={120}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Tests detour behavior around the northern wall..."
              className="bg-slate-950/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                closeSavePreset();
                playClick();
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={savedSuccess || !name.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
            >
              {savedSuccess ? (
                <>
                  <BookmarkCheck size={14} className="text-emerald-300" />
                  <span>Saved to Storage!</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Preset</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
