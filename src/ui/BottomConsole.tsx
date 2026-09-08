/**
 * BottomConsole — Bottom Timeline Scrubber & Playback Transport.
 *
 * Implements Section 5.5 of the UI/UX Guidelines:
 * - Fixed at bottom center, Dark Bluish Grey (#595D60) with 3px black border.
 * - Chunky circular brick buttons: Reset (⏮), Play/Pause (▶/⏸ in Brick Red), Step (⏭ in Brick Blue).
 * - Step counter (Step X).
 * - Stud progress track (filled studs = Brick Yellow, unfilled = Light Bluish Grey).
 * - 5-notch discrete stud speed selector.
 *
 * @module ui/BottomConsole
 */

import { useMemo } from 'react';
import { useRaceStore } from '../state/raceStore';
import { useAgentStore } from '../state/agentStore';
import { playClick, playSnap, playStartFanfare, playStepTick } from '../utils/sound';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
} from 'lucide-react';

const SPEED_NOTCHES = [
  { label: '0.5x', delay: 150 },
  { label: '1x', delay: 80 },
  { label: '2x', delay: 40 },
  { label: '5x', delay: 15 },
  { label: 'MAX', delay: 5 },
] as const;

export function BottomConsole() {
  const raceStatus = useRaceStore((s) => s.status);
  const isRunning = raceStatus === 'running';
  const speed = useRaceStore((s) => s.speed);
  const setSpeed = useRaceStore((s) => s.setSpeed);
  const stepCount = useRaceStore((s) => s.stepCount);
  const startRace = useRaceStore((s) => s.startRace);
  const pauseRace = useRaceStore((s) => s.pauseRace);
  const resetRace = useRaceStore((s) => s.resetRace);
  const stepForward = useRaceStore((s) => s.stepForward);

  const agents = useAgentStore((s) => s.agents);
  const canPlay = agents.length > 0;

  // Active speed notch index (0..4)
  const currentNotchIndex = useMemo(() => {
    let closestIdx = 1;
    let minDiff = Infinity;
    SPEED_NOTCHES.forEach((notch, idx) => {
      const diff = Math.abs(speed - notch.delay);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    return closestIdx;
  }, [speed]);

  const handlePlayToggle = () => {
    if (isRunning) {
      pauseRace();
      playClick();
    } else {
      if (!canPlay) return;
      startRace();
      playStartFanfare();
    }
  };

  const handleReset = () => {
    resetRace();
    playClick();
  };

  const handleStep = () => {
    if (!isRunning) {
      stepForward();
      playStepTick();
    }
  };

  // 12-stud progress track representation
  const TOTAL_TRACK_STUDS = 12;
  const filledStudsCount = useMemo(() => {
    if (raceStatus === 'finished') return TOTAL_TRACK_STUDS;
    if (stepCount === 0) return 0;
    // Visually cycle or fill based on active step count
    return Math.min(TOTAL_TRACK_STUDS, Math.max(1, Math.floor((stepCount % (TOTAL_TRACK_STUDS * 4)) / 4) + 1));
  }, [raceStatus, stepCount]);

  return (
    <footer className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto select-none">
      <div className="bg-[#F4F4F4] border-[3px] border-[#05131D] rounded-2xl px-4 py-2 flex items-center gap-3.5 shadow-[0_6px_0_rgba(5,19,29,0.35)] text-[#05131D]">
        {/* Playback Transport Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Reset (⏮) */}
          <button
            onClick={handleReset}
            disabled={!canPlay && stepCount === 0}
            className="w-9 h-9 rounded-full bg-[#0055BF] hover:bg-[#0047a3] text-[#F4F4F4] brick-btn flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_3px_0_#05131D]"
            title="Reset Race [R]"
            aria-label="Reset Race"
          >
            <RotateCcw size={15} />
          </button>

          {/* Play / Pause (▶ / ⏸) — Chunky Brick Red */}
          <button
            onClick={handlePlayToggle}
            disabled={!canPlay}
            className="w-10 h-10 rounded-full bg-[#C91A09] hover:bg-[#b01607] text-[#F4F4F4] brick-btn flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_0_#05131D]"
            title={isRunning ? 'Pause [Space]' : 'Start [Space]'}
            aria-label={isRunning ? 'Pause' : 'Start'}
          >
            {isRunning ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="fill-current translate-x-0.5" />
            )}
          </button>

          {/* Step Forward (⏭) — Brick Blue */}
          <button
            onClick={handleStep}
            disabled={isRunning || !canPlay}
            className="w-9 h-9 rounded-full bg-[#0055BF] hover:bg-[#0047a3] text-[#F4F4F4] brick-btn flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_3px_0_#05131D]"
            title="Step 1 Tick [→]"
            aria-label="Step Forward"
          >
            <StepForward size={15} />
          </button>
        </div>

        {/* Step Counter Badge */}
        <div className="px-2.5 py-1 rounded-lg bg-white border-2 border-[#05131D] font-mono text-xs font-bold text-[#05131D] shrink-0 shadow-sm">
          <span className="text-[#595D60] mr-1">STEP</span>
          <span>{stepCount}</span>
        </div>

        {/* Stud Progress Track (Section 5.5) */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E0E3E7] border-2 border-[#05131D]"
          title="Race timeline progress track"
        >
          {Array.from({ length: TOTAL_TRACK_STUDS }).map((_, i) => {
            const isFilled = i < filledStudsCount;
            return (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full border border-[#05131D] transition-colors duration-100 ${
                  isFilled
                    ? 'bg-[#F2CD37] shadow-[0_1px_0_#05131D]'
                    : 'bg-[#A3A2A4]/60'
                }`}
              />
            );
          })}
        </div>

        {/* 5-Notch Discrete Stud Speed Selector (Section 5.5) */}
        <div className="flex items-center gap-2 pl-1 border-l-2 border-[#05131D]/20">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#595D60] uppercase hidden md:inline">
            Speed
          </span>

          <div className="flex items-center gap-1">
            {SPEED_NOTCHES.map((notch, idx) => {
              const isSelected = idx <= currentNotchIndex;
              const isExact = idx === currentNotchIndex;

              return (
                <button
                  key={notch.label}
                  onClick={() => {
                    setSpeed(notch.delay);
                    playSnap();
                  }}
                  className={`w-5 h-5 rounded-md border-2 border-[#05131D] flex items-center justify-center transition-all cursor-pointer ${
                    isExact
                      ? 'bg-[#F2CD37] text-[#05131D] font-bold shadow-[0_2px_0_#05131D] -translate-y-0.5'
                      : isSelected
                        ? 'bg-[#F2CD37]/70 text-[#05131D]'
                        : 'bg-[#E0E3E7] text-[#595D60] hover:bg-[#D0D4D9]'
                  }`}
                  title={`Speed: ${notch.label}`}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                </button>
              );
            })}
          </div>

          <span className="font-mono text-[10px] font-bold text-[#05131D] w-8 text-right">
            {SPEED_NOTCHES[currentNotchIndex]?.label}
          </span>
        </div>
      </div>
    </footer>
  );
}
