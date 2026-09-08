/**
 * Web Audio Synthesizer — Zero-dependency retro-modern game sound effects.
 *
 * Provides responsive synthesized audio feedback for UI clicks, race start,
 * step advance, finish chimes, and tool selection.
 *
 * @module utils/sound
 */

import { useSoundStore } from '../state/soundStore';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function getMasterVolume(): number {
  const store = useSoundStore.getState();
  if (!store.enabled) return 0;
  return Math.max(0, Math.min(1, store.volume ?? 0.75));
}

/** Soft UI click blip */
export function playClick(): void {
  const vol = getMasterVolume();
  if (vol <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.04);

  gain.gain.setValueAtTime(0.08 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.04);
}

/** Crisp acoustic tick for button hover */
export function playMenuHover(): void {
  const vol = getMasterVolume();
  if (vol <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.015);

  gain.gain.setValueAtTime(0.025 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.015);
}

/** Indie game descending pause chime */
export function playPause(): void {
  const vol = getMasterVolume();
  if (vol <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [640, 420];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + i * 0.06;
    const dur = 0.12;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.08 * vol, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + dur);
  });
}

/** Indie game ascending resume chime */
export function playResume(): void {
  const vol = getMasterVolume();
  if (vol <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [420, 640];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + i * 0.05;
    const dur = 0.1;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.07 * vol, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + dur);
  });
}

/** Upbeat race start fanfare */
export function playStartFanfare(): void {
  const vol = getMasterVolume();
  if (vol <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = ctx.currentTime + index * 0.07;
    const duration = 0.12;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.12 * vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  });
}

/** Victory chime when an agent reaches the goal */
export function playGoalChime(): void {
  const vol = getMasterVolume();
  if (vol <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [783.99, 987.77, 1174.66]; // G5, B5, D6
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = ctx.currentTime + index * 0.09;
    const duration = 0.25;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.15 * vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  });
}

/** Tactile placement tap for painting walls/tiles */
export function playPlace(): void {
  const vol = getMasterVolume();
  if (vol <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.1 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

/** Soft tick for step advance */
export function playStepTick(): void {
  const vol = getMasterVolume();
  if (vol <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.02);

  gain.gain.setValueAtTime(0.04 * vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.02);
}
