"use client";

type SoundName = "drop" | "burn" | "win" | "lose" | "hover" | "select";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  c: AudioContext,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType,
  gain: number,
  freqEnd?: number,
) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + start);
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, c.currentTime + start + dur);
  g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  osc.connect(g).connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur + 0.02);
}

function noiseBurst(c: AudioContext, start: number, dur: number, gain: number) {
  const bufferSize = Math.floor(c.sampleRate * dur);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1400;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(c.destination);
  src.start(c.currentTime + start);
}

export function playSound(name: SoundName, volume = 0.7) {
  const c = getCtx();
  if (!c) return;
  const v = Math.max(0, Math.min(1, volume));
  switch (name) {
    case "drop":
      tone(c, 220, 0, 0.18, "triangle", 0.25 * v, 90);
      tone(c, 110, 0.02, 0.22, "sine", 0.18 * v);
      break;
    case "burn":
      noiseBurst(c, 0, 0.4, 0.3 * v);
      tone(c, 180, 0, 0.3, "sawtooth", 0.08 * v, 60);
      break;
    case "win":
      [523, 659, 784, 1047].forEach((f, i) => tone(c, f, i * 0.09, 0.25, "triangle", 0.22 * v));
      break;
    case "lose":
      [392, 330, 262].forEach((f, i) => tone(c, f, i * 0.12, 0.3, "sine", 0.2 * v));
      break;
    case "hover":
      tone(c, 660, 0, 0.04, "sine", 0.05 * v);
      break;
    case "select":
      tone(c, 880, 0, 0.06, "square", 0.08 * v);
      break;
  }
}
