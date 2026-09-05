/**
 * PresetChooserModal — Fullscreen/centered map preset browser.
 *
 * Lets players explore curated challenges and custom user-saved maps,
 * complete with vector mini-map previews, obstacle stats, and 1-click loading.
 *
 * @module ui/PresetChooserModal
 */

import { useState, useEffect, useMemo } from 'react';
import { usePresetStore } from '../state/presetStore';
import { useGameMenuStore } from '../state/gameMenuStore';
import { useGridStore } from '../state/gridStore';
import { PRESETS, type MapPreset } from '../maps/presets';
import { MiniMapPreview } from './MiniMapPreview';
import { playClick } from '../utils/sound';
import {
  X,
  Map,
  Plus,
  Trash2,
  Play,
  Layers,
  Search,
} from 'lucide-react';

export function PresetChooserModal() {
  const isOpen = useGameMenuStore((s) => s.isPresetChooserOpen);
  const closePresetChooser = useGameMenuStore((s) => s.closePresetChooser);
  const openSavePreset = useGameMenuStore((s) => s.openSavePreset);
  const closeStartMenu = useGameMenuStore((s) => s.closeStartMenu);

  const customPresets = usePresetStore((s) => s.customPresets);
  const deleteCustomPreset = usePresetStore((s) => s.deleteCustomPreset);
  const loadPresetIntoArena = usePresetStore((s) => s.loadPresetIntoArena);

  const currentWallsCount = useGridStore((s) => s.walls.size);
  const currentCostsCount = useGridStore((s) => s.costs.size);

  const [activeTab, setActiveTab] = useState<'all' | 'official' | 'custom'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePresetChooser();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closePresetChooser]);

  const officialList = useMemo(() => Object.values(PRESETS), []);
  const allPresets = useMemo(() => [...officialList, ...customPresets], [officialList, customPresets]);

  const filteredPresets = useMemo(() => {
    let list = allPresets;
    if (activeTab === 'official') {
      list = officialList;
    } else if (activeTab === 'custom') {
      list = customPresets;
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        `${p.width}x${p.height}`.includes(q),
    );
  }, [allPresets, officialList, customPresets, activeTab, searchQuery]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: MapPreset) => {
    loadPresetIntoArena(preset);
    closePresetChooser();
    closeStartMenu(); // If launched from Start Menu, transition straight to arena
  };

  return (
    <div
      onClick={closePresetChooser}
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-[115] flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900/95 border border-white/10 rounded-2xl p-6 max-w-4xl w-full text-slate-200 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <Map size={20} className="text-blue-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Map Presets & Arenas
              </h2>
              <p className="text-xs text-slate-400">
                Choose a curated pathfinding challenge or load your saved custom designs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Save Current Board Button */}
            {(currentWallsCount > 0 || currentCostsCount > 0) && (
              <button
                onClick={() => {
                  openSavePreset();
                  playClick();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-medium transition-colors"
                title="Save current arena layout as a custom preset"
              >
                <Plus size={14} />
                <span>Save Current Board</span>
              </button>
            )}

            <button
              onClick={() => {
                closePresetChooser();
                playClick();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close [Esc]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Toolbar: Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/5 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('all');
                playClick();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({allPresets.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('official');
                playClick();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'official'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Curated ({officialList.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('custom');
                playClick();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'custom'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Saved ({customPresets.length})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search presets..."
              className="w-full bg-slate-950/70 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1 overflow-y-auto max-h-[58vh] pr-1">
          {filteredPresets.map((preset) => {
            const isCustom = preset.category === 'custom';
            const costCount = preset.costs ? preset.costs.length : 0;

            return (
              <div
                key={preset.id ?? preset.name}
                className="flex items-start gap-3.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
              >
                {/* Mini-map thumbnail */}
                <MiniMapPreview preset={preset} size={92} />

                {/* Details */}
                <div className="flex flex-col justify-between flex-1 min-w-0 h-full gap-2">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-semibold text-white text-xs truncate">
                        {preset.name}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300 shrink-0">
                        {preset.width}×{preset.height}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {preset.description}
                    </p>

                    {/* Stats pills */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-[10px] text-slate-500 font-mono">
                      <span>{preset.walls.length} walls</span>
                      {costCount > 0 && <span>• {costCount} rough</span>}
                      <span>• ({preset.start.x},{preset.start.y}) → ({preset.goal.x},{preset.goal.y})</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5 mt-1">
                    {isCustom ? (
                      <button
                        onClick={() => {
                          if (preset.id) deleteCustomPreset(preset.id);
                        }}
                        className="p-1 rounded text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete custom preset"
                      >
                        <Trash2 size={13} />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-medium">Curated Map</span>
                    )}

                    <button
                      onClick={() => handleSelectPreset(preset)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors ml-auto"
                      title="Load preset into arena"
                    >
                      <Play size={12} />
                      <span>Load Map</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredPresets.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center gap-2 text-slate-500">
              <Layers size={32} className="opacity-40" />
              <p className="text-xs">No matching map presets found.</p>
              {activeTab === 'custom' && (
                <p className="text-[11px] text-slate-400">
                  Build custom walls on the board and click "Save Current Board" to create your first map!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
