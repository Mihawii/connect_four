"use client";

type SoundName = "drop" | "burn" | "win" | "lose" | "hover" | "select";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/* ── Primitives ───────────────────────────────────────────────────────────── */

/** Tonal oscillator with linear attack and exponential decay. */
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
  if (freqEnd)
    osc.frequency.exponentialRampToValueAtTime(
      freqEnd,
      c.currentTime + start + dur,
    );
  g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + start + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  osc.connect(g).connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur + 0.02);
}

/** Shaped noise burst through a biquad filter — the basis of all "physical" textures. */
function filteredNoise(
  c: AudioContext,
  start: number,
  dur: number,
  gain: number,
  filterFreq: number,
  filterQ = 1,
  filterType: BiquadFilterType = "bandpass",
) {
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const env = Math.pow(1 - i / len, 3); // fast natural decay
    data[i] = (Math.random() * 2 - 1) * env;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const flt = c.createBiquadFilter();
  flt.type = filterType;
  flt.frequency.value = filterFreq;
  flt.Q.value = filterQ;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(flt).connect(g).connect(c.destination);
  src.start(c.currentTime + start);
}

/* ── Public API ───────────────────────────────────────────────────────────── */

export function playSound(name: SoundName, volume = 0.7) {
  const c = getCtx();
  if (!c) return;
  const v = Math.max(0, Math.min(1, volume));

  switch (name) {
    /* Wooden disc landing in a slot: short thud + resonant tap */
    case "drop":
      filteredNoise(c, 0, 0.08, 0.3 * v, 320, 2, "bandpass");
      tone(c, 140, 0, 0.12, "sine", 0.18 * v, 70);
      tone(c, 280, 0.005, 0.06, "triangle", 0.07 * v);
      break;

    /* Crackling ember: layered tiny noise pops + a warm undertone */
    case "burn":
      filteredNoise(c, 0, 0.15, 0.12 * v, 2200, 3, "highpass");
      filteredNoise(c, 0.04, 0.1, 0.08 * v, 3000, 2, "bandpass");
      filteredNoise(c, 0.09, 0.12, 0.06 * v, 1800, 2, "bandpass");
      tone(c, 120, 0, 0.22, "sine", 0.04 * v, 60);
      break;

    /* Warm ascending chord, slightly detuned for organic feel */
    case "win":
      tone(c, 523, 0, 0.35, "sine", 0.14 * v);
      tone(c, 526, 0, 0.35, "triangle", 0.05 * v);
      tone(c, 659, 0.08, 0.3, "sine", 0.13 * v);
      tone(c, 784, 0.16, 0.32, "sine", 0.12 * v);
      tone(c, 787, 0.16, 0.32, "triangle", 0.04 * v);
      tone(c, 1047, 0.24, 0.4, "sine", 0.11 * v);
      break;

    /* Gentle descending melody, softer and more musical */
    case "lose":
      tone(c, 440, 0, 0.4, "sine", 0.11 * v);
      tone(c, 392, 0.15, 0.4, "sine", 0.09 * v);
      tone(c, 330, 0.3, 0.5, "sine", 0.07 * v);
      tone(c, 262, 0.45, 0.6, "sine", 0.05 * v);
      break;

    /* Subtle wood tap */
    case "hover":
      filteredNoise(c, 0, 0.025, 0.04 * v, 800, 1, "bandpass");
      break;

    /* Satisfying tactile click */
    case "select":
      filteredNoise(c, 0, 0.04, 0.12 * v, 500, 2, "bandpass");
      tone(c, 600, 0, 0.05, "sine", 0.05 * v);
      break;
  }
}
