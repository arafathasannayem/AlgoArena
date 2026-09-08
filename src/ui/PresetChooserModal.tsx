/**
 * PresetChooserModal — Brick-Themed Map Preset Browser.
 *
 * Implements Section 4.3 & 4.5 of the UI/UX Guidelines:
 * - Brick White (#F4F4F4) card with 3px black border and hard offset drop shadow.
 * - Top header with 4 raised LEGO studs and circular close button.
 * - Horizontal brick tab strip.
 * - Tactile preset cards with vector mini-map previews.
 *
 * @module ui/PresetChooserModal
 */

import { useState, useEffect, useMemo } from 'react';
import { usePresetStore } from '../state/presetStore';
import { useGameMenuStore } from '../state/gameMenuStore';
import { useGridStore } from '../state/gridStore';
import { PRESETS, type MapPreset } from '../maps/presets';
import { MiniMapPreview } from './MiniMapPreview';
import { playClick, playSnap } from '../utils/sound';
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
    closeStartMenu();
    playSnap();
  };

  return (
    <div
      onClick={closePresetChooser}
      className="fixed inset-0 bg-[#05131D]/65 backdrop-blur-sm z-[115] flex items-center justify-center p-4 overflow-y-auto select-none animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#F4F4F4] border-[3px] border-[#05131D] rounded-3xl p-6 max-w-4xl w-full text-[#05131D] shadow-[0_10px_0_rgba(5,19,29,0.35)] flex flex-col gap-4 max-h-[90vh] overflow-y-auto relative"
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
            closePresetChooser();
            playClick();
          }}
          className="absolute right-4 top-4 w-7 h-7 rounded-full bg-[#582A12] hover:bg-[#6e3618] border-2 border-[#05131D] text-[#F4F4F4] flex items-center justify-center shadow-[0_2px_0_#05131D] active:translate-y-0.5 cursor-pointer"
          title="Close [Esc]"
        >
          <X size={14} />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#05131D]/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#0055BF] text-[#F4F4F4] border-2 border-[#05131D] shadow-[0_2px_0_#05131D]">
              <Map size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#05131D] uppercase font-display">
                Map Presets & Arenas
              </h2>
              <p className="text-xs text-[#595D60] font-semibold">
                Choose a curated pathfinding challenge or load your custom designs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-8">
            {/* Quick Save Current Board Button */}
            {(currentWallsCount > 0 || currentCostsCount > 0) && (
              <button
                onClick={() => {
                  openSavePreset();
                  playClick();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F2CD37] hover:bg-[#e0bc2c] border-2 border-[#05131D] text-[#05131D] text-xs font-bold shadow-[0_2px_0_#05131D] brick-btn cursor-pointer"
                title="Save current arena layout as a custom preset"
              >
                <Plus size={14} />
                <span>Save Current</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Toolbar: Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Tabs as connected brick tiles (§4.5) */}
          <div className="flex items-center gap-1 p-1 bg-[#e8e8e8] border-2 border-[#05131D] rounded-xl">
            <button
              onClick={() => {
                setActiveTab('all');
                playClick();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#0055BF] text-[#F4F4F4] shadow-[0_2px_0_#05131D] border border-[#05131D]'
                  : 'text-[#595D60] hover:text-[#05131D]'
              }`}
            >
              All ({allPresets.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('official');
                playClick();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'official'
                  ? 'bg-[#0055BF] text-[#F4F4F4] shadow-[0_2px_0_#05131D] border border-[#05131D]'
                  : 'text-[#595D60] hover:text-[#05131D]'
              }`}
            >
              Curated ({officialList.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('custom');
                playClick();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-[#0055BF] text-[#F4F4F4] shadow-[0_2px_0_#05131D] border border-[#05131D]'
                  : 'text-[#595D60] hover:text-[#05131D]'
              }`}
            >
              Custom ({customPresets.length})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#595D60]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search presets..."
              className="w-full bg-white border-2 border-[#05131D] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#05131D] font-bold placeholder:text-[#A3A2A4] focus:outline-none focus:ring-2 focus:ring-[#0055BF]"
            />
          </div>
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1 overflow-y-auto max-h-[55vh] pr-1">
          {filteredPresets.map((preset) => {
            const isCustom = preset.category === 'custom';
            const costCount = preset.costs ? preset.costs.length : 0;

            return (
              <div
                key={preset.id ?? preset.name}
                className="flex items-start gap-3.5 p-3 rounded-2xl bg-white border-2 border-[#05131D] hover:border-[#05131D] shadow-[0_3px_0_#05131D] transition-all group"
              >
                {/* Mini-map thumbnail */}
                <div className="rounded-xl border-2 border-[#05131D] overflow-hidden shrink-0 shadow-inner bg-[#237841]">
                  <MiniMapPreview preset={preset} size={92} />
                </div>

                {/* Details */}
                <div className="flex flex-col justify-between flex-1 min-w-0 h-full gap-2">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-display font-black text-[#05131D] text-xs truncate">
                        {preset.name}
                      </h4>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-[#e8e8e8] border border-[#05131D]/20 text-[#05131D] shrink-0">
                        {preset.width}×{preset.height}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#595D60] line-clamp-2 mt-0.5 leading-relaxed font-medium">
                      {preset.description}
                    </p>

                    {/* Stats pills */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-[10px] text-[#595D60] font-mono font-bold">
                      <span>{preset.walls.length} walls</span>
                      {costCount > 0 && <span>• {costCount} rough</span>}
                      <span>• ({preset.start.x},{preset.start.y}) → ({preset.goal.x},{preset.goal.y})</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#05131D]/10 mt-1">
                    {isCustom ? (
                      <button
                        onClick={() => {
                          if (preset.id) deleteCustomPreset(preset.id);
                          playClick();
                        }}
                        className="p-1 rounded text-[#C91A09] hover:bg-[#C91A09]/10 transition-colors cursor-pointer"
                        title="Delete custom preset"
                      >
                        <Trash2 size={13} />
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#A3A2A4] font-bold">Curated</span>
                    )}

                    <button
                      onClick={() => handleSelectPreset(preset)}
                      className="brick-btn flex items-center gap-1 px-3 py-1 rounded-xl bg-[#C91A09] hover:bg-[#b01607] text-[#F4F4F4] text-xs font-bold shadow-[0_2px_0_#05131D] ml-auto cursor-pointer"
                      title="Load preset into arena"
                    >
                      <Play size={12} className="fill-current" />
                      <span>Load Map</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredPresets.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center gap-2 text-[#595D60]">
              <Layers size={32} className="opacity-40" />
              <p className="text-xs font-bold font-display">No matching map presets found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
