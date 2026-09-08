/**
 * SavePresetModal — Brick-Themed Save Custom Map Dialog.
 *
 * Implements Section 4.3 of the UI/UX Guidelines:
 * - Brick White (#F4F4F4) card with 3px black border and hard offset drop shadow.
 * - Top header with 4 raised LEGO studs and circular close button.
 * - Captures grid dimensions, walls, rough terrain costs, start point, and goal coordinates.
 *
 * @module ui/SavePresetModal
 */

import { useState, useEffect, useMemo } from 'react';
import { useGridStore } from '../state/gridStore';
import { usePresetStore } from '../state/presetStore';
import { useGameMenuStore } from '../state/gameMenuStore';
import { MiniMapPreview } from './MiniMapPreview';
import { playClick, playSnap } from '../utils/sound';
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
      playSnap();
      setSavedSuccess(true);
      setTimeout(() => {
        closeSavePreset();
      }, 700);
    }
  };

  return (
    <div
      onClick={closeSavePreset}
      className="fixed inset-0 bg-[#05131D]/65 backdrop-blur-sm z-[130] flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#F4F4F4] border-[3px] border-[#05131D] rounded-3xl p-6 max-w-md w-full text-[#05131D] shadow-[0_8px_0_rgba(5,19,29,0.35)] flex flex-col gap-4 relative"
      >
        {/* 4 Raised Studs Header Affordance (§4.3) */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-4 h-2.5 rounded-t-full bg-[#A3A2A4] border-2 border-b-0 border-[#05131D]" />
          <div className="w-4 h-2.5 rounded-t-full bg-[#A3A2A4] border-2 border-b-0 border-[#05131D]" />
          <div className="w-4 h-2.5 rounded-t-full bg-[#A3A2A4] border-2 border-b-0 border-[#05131D]" />
          <div className="w-4 h-2.5 rounded-t-full bg-[#A3A2A4] border-2 border-b-0 border-[#05131D]" />
        </div>

        {/* Circular Reddish-Brown 1x1 Round Close Button */}
        <button
          onClick={() => {
            closeSavePreset();
            playClick();
          }}
          className="absolute right-4 top-4 w-7 h-7 rounded-full bg-[#582A12] hover:bg-[#6e3618] border-2 border-[#05131D] text-[#F4F4F4] flex items-center justify-center shadow-[0_2px_0_#05131D] active:translate-y-0.5 cursor-pointer"
          title="Cancel [Esc]"
        >
          <X size={14} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 border-b-2 border-[#05131D]/15 pb-3">
          <div className="p-2 rounded-xl bg-[#0055BF] text-[#F4F4F4] border-2 border-[#05131D] shadow-[0_2px_0_#05131D]">
            <Save size={18} />
          </div>
          <div>
            <h3 className="text-base font-black text-[#05131D] uppercase font-display">
              Save Board Map
            </h3>
            <p className="text-xs text-[#595D60] font-semibold">
              Persist your maze layout to browser storage
            </p>
          </div>
        </div>

        {/* Preview & Stats Summary */}
        <div className="flex items-center gap-4 p-3 rounded-2xl bg-white border-2 border-[#05131D] shadow-[0_2px_0_#05131D]">
          <div className="rounded-xl border-2 border-[#05131D] overflow-hidden shrink-0 shadow-inner bg-[#237841]">
            <MiniMapPreview preset={previewPreset} size={84} />
          </div>
          <div className="flex flex-col gap-0.5 text-xs font-medium">
            <span className="font-display font-black text-sm text-[#05131D]">{width}×{height} Grid</span>
            <span className="text-[#595D60] font-bold">{walls.size} obstacle walls</span>
            <span className="text-[#595D60] font-bold">{costs.size} rough terrain tiles</span>
            <span className="text-[#A3A2A4] font-mono text-[10px] font-bold">
              ({start.x},{start.y}) → ({goals[0]!.x},{goals[0]!.y})
            </span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-black text-[#05131D] uppercase font-display">
              Map Name
            </label>
            <input
              type="text"
              required
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Castle Maze, Stud Highway"
              className="bg-white border-2 border-[#05131D] rounded-xl px-3 py-2 text-xs font-bold text-[#05131D] placeholder:text-[#A3A2A4] focus:outline-none focus:ring-2 focus:ring-[#0055BF]"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-black text-[#05131D] uppercase font-display">
              Description <span className="text-[#595D60] font-normal normal-case">(optional)</span>
            </label>
            <textarea
              rows={2}
              maxLength={120}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Tests detour behavior with bottleneck..."
              className="bg-white border-2 border-[#05131D] rounded-xl px-3 py-2 text-xs font-bold text-[#05131D] placeholder:text-[#A3A2A4] focus:outline-none focus:ring-2 focus:ring-[#0055BF] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-[#05131D]/15">
            <button
              type="button"
              onClick={() => {
                closeSavePreset();
                playClick();
              }}
              className="brick-btn px-3.5 py-1.5 rounded-xl bg-[#A3A2A4] text-[#05131D] text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={savedSuccess || !name.trim()}
              className="brick-btn flex items-center gap-1.5 px-4 py-1.5 bg-[#0055BF] hover:bg-[#0047a3] text-[#F4F4F4] rounded-xl text-xs font-bold shadow-[0_3px_0_#05131D] cursor-pointer disabled:opacity-40"
            >
              {savedSuccess ? (
                <>
                  <BookmarkCheck size={14} className="text-[#F2CD37]" />
                  <span>Saved!</span>
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
