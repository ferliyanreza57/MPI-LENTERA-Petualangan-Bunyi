import { SoundEffectType } from '../types/lentera';

let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let masterGain: GainNode | null = null;
let activeSoundEndTime = 0;
let activeSampleSource: AudioBufferSourceNode | null = null;
let activeHtmlAudio: HTMLAudioElement | null = null;
let samplePlayToken = 0;

const REAL_AUDIO_FILES: Partial<Record<SoundEffectType, string>> = {
  bell: '/assets/aistudio/bel-sekolah_b9adcdcb.mp3',
  bird: '/assets/aistudio/suara-burung_97a24067.mp3',
  vehicle: '/assets/aistudio/suara_kendaraan_motor_8e650ae6.mp3',
  guitar: '/assets/aistudio/Gitar_0154968d.mp3',
  drum: '/assets/aistudio/drum_2292229b.mp3',
  rain: '/assets/aistudio/hujan_16f3c0b5.mp3',
  desah: '/assets/aistudio/hujan_16f3c0b5.mp3',
  clap: '/assets/aistudio/tepuk_tangan_6d06f744.mp3',
  flute: '/assets/aistudio/Seruling1_ff1868fd.mp3',
  nada: '/assets/aistudio/Seruling1_ff1868fd.mp3',
  violin: '/assets/aistudio/Biola_fe22a1c5.mp3',
  angklung: '/assets/aistudio/Angklung_e67a78f0.mp3',
};

const decodedAudioCache = new Map<string, AudioBuffer>();
const pendingDecodeCache = new Map<string, Promise<AudioBuffer | null>>();

export function stopActiveSample(): void {
  samplePlayToken += 1;
  if (activeSampleSource) {
    try {
      activeSampleSource.stop();
      activeSampleSource.disconnect();
    } catch {
      // Ignore already-stopped source
    }
    activeSampleSource = null;
  }
  if (activeHtmlAudio) {
    try {
      activeHtmlAudio.pause();
      activeHtmlAudio.currentTime = 0;
    } catch {
      // Ignore
    }
    activeHtmlAudio = null;
  }
  if (audioCtx) {
    activeSoundEndTime = Math.min(activeSoundEndTime, audioCtx.currentTime);
  } else {
    activeSoundEndTime = 0;
  }
}

async function loadAudioBuffer(ctx: AudioContext, url: string): Promise<AudioBuffer | null> {
  const cached = decodedAudioCache.get(url);
  if (cached) return cached;

  const existing = pendingDecodeCache.get(url);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const arr = await res.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arr);
      decodedAudioCache.set(url, decoded);
      return decoded;
    } catch {
      return null;
    } finally {
      pendingDecodeCache.delete(url);
    }
  })();

  pendingDecodeCache.set(url, promise);
  return promise;
}

function playRecordedSample(url: string): void {
  stopActiveSample();
  const token = samplePlayToken;
  const setup = ensureAudio();
  if (!setup) {
    try {
      const audio = new Audio(url);
      activeHtmlAudio = audio;
      audio.play().catch(() => {});
    } catch {
      // Ignore
    }
    return;
  }

  const { ctx, out } = setup;
  loadAudioBuffer(ctx, url).then((buffer) => {
    if (token !== samplePlayToken) return;
    if (!buffer) {
      try {
        const audio = new Audio(url);
        activeHtmlAudio = audio;
        audio.play().catch(() => {});
      } catch {
        // Ignore
      }
      return;
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(out);
    src.onended = () => {
      if (activeSampleSource === src) {
        activeSampleSource = null;
      }
    };
    activeSampleSource = src;
    const now = ctx.currentTime;
    src.start(now);
    activeSoundEndTime = Math.max(activeSoundEndTime, now + buffer.duration);
  });
}

function ensureAudio(): { ctx: AudioContext; out: GainNode } | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.85;
    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  if (!masterGain) return null;
  return { ctx: audioCtx, out: masterGain };
}

export function isAudioActive(): boolean {
  if (!audioCtx) return false;
  return audioCtx.currentTime < activeSoundEndTime;
}

export function getWaveformData(target: Uint8Array<ArrayBuffer>): boolean {
  if (!analyser) return false;
  analyser.getByteTimeDomainData(target);
  return isAudioActive();
}

export function speakIndonesianNarration(text: string, enabled: boolean): void {
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'id-ID';
    utter.rate = 1.0;
    utter.pitch = 1.06;
    window.speechSynthesis.speak(utter);
  } catch {
    // Graceful fallback if SpeechSynthesis is unavailable
  }
}

export function stopNarration(): void {
  stopActiveSample();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}

export function playToneHz(freq: number, durationSec: number, wave: OscillatorType = 'sine', enabled = true): void {
  if (!enabled) return;
  const setup = ensureAudio();
  if (!setup) return;
  const { ctx, out } = setup;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.24, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);
  osc.connect(gain);
  gain.connect(out);
  osc.start(now);
  osc.stop(now + durationSec + 0.02);
  activeSoundEndTime = Math.max(activeSoundEndTime, now + durationSec);
}

export function playSoundEffect(type: SoundEffectType, enabled = true): void {
  if (!enabled) return;

  const realAudioUrl = REAL_AUDIO_FILES[type];
  if (realAudioUrl) {
    playRecordedSample(realAudioUrl);
    return;
  }

  if (type !== 'click' && type !== 'fanfare' && type !== 'error') {
    stopActiveSample();
  }

  const setup = ensureAudio();
  if (!setup) return;
  const { ctx, out } = setup;
  const now = ctx.currentTime;
  let duration = 0.5;

  if (type === 'click') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.07);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.08);
    duration = 0.08;
  } else if (type === 'error') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.linearRampToValueAtTime(160, now + 0.25);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.3);
    duration = 0.3;
  } else if (type === 'bell') {
    [880, 1760, 2640].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.22 / (i + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.15);
      osc.connect(gain);
      gain.connect(out);
      osc.start(now);
      osc.stop(now + 1.18);
    });
    duration = 1.15;
  } else if (type === 'drum') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.38);
    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.42);
    duration = 0.42;
  } else if (type === 'vehicle') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.linearRampToValueAtTime(145, now + 0.35);
    osc.frequency.linearRampToValueAtTime(115, now + 0.75);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.82);
    duration = 0.82;
  } else if (type === 'guitar') {
    [329.63, 440, 554.37, 659.25].forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now + idx * 0.06);
      osc.frequency.setValueAtTime(f, now + idx * 0.06);
      gain.gain.setValueAtTime(0.14, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.75);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(out);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.78);
    });
    duration = 0.96;
  } else if (type === 'violin') {
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(523.25, now + 0.45);
    lfo.frequency.value = 5.5;
    lfoGain.gain.value = 6;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    filter.type = 'lowpass';
    filter.frequency.value = 1800;
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    osc.start(now);
    lfo.start(now);
    osc.stop(now + 0.98);
    lfo.stop(now + 0.98);
    duration = 0.98;
  } else if (type === 'angklung') {
    // Authentic bamboo shake rapid repeated wooden-resonant notes
    const notes = [523.25, 1046.5];
    for (let beat = 0; beat < 8; beat++) {
      const start = now + beat * 0.075;
      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, start);
        gain.gain.setValueAtTime(0.18 / (idx + 1), start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.07);
        osc.connect(gain);
        gain.connect(out);
        osc.start(start);
        osc.stop(start + 0.075);
      });
    }
    duration = 0.7;
  } else if (type === 'bird') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1850, now);
    osc.frequency.linearRampToValueAtTime(2850, now + 0.12);
    osc.frequency.linearRampToValueAtTime(2100, now + 0.25);
    osc.frequency.linearRampToValueAtTime(3200, now + 0.4);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.5);
    duration = 0.5;
  } else if (type === 'rain' || type === 'desah') {
    const bufferSize = Math.floor(ctx.sampleRate * 0.75);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1150;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    noise.start(now);
    duration = 0.75;
  } else if (type === 'clap' || type === 'dentum') {
    const bufferSize = Math.floor(ctx.sampleRate * 0.4);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.55, now);
    noise.connect(gain);
    gain.connect(out);
    noise.start(now);
    duration = 0.4;
  } else if (type === 'flute' || type === 'nada') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.setValueAtTime(659.25, now + 0.25);
    osc.frequency.setValueAtTime(783.99, now + 0.5);
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.96);
    duration = 0.96;
  } else if (type === 'cup_clear') {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.12);
      gain.gain.setValueAtTime(0.26, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.25);
      osc.connect(gain);
      gain.connect(out);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.27);
    });
    duration = 0.7;
  } else if (type === 'cup_muffled') {
    [175, 160, 145].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.18);
      gain.gain.setValueAtTime(0.06, now + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.2);
      osc.connect(gain);
      gain.connect(out);
      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 0.22);
    });
    duration = 0.7;
  } else if (type === 'fanfare') {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.09);
      gain.gain.setValueAtTime(0.22, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.45);
      osc.connect(gain);
      gain.connect(out);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.48);
    });
    duration = 0.85;
  } else if (type === 'infra') {
    // Audible sub-bass demonstration rumble (45 Hz) representing < 20 Hz infrasound pulse
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(52, now);
    osc.frequency.linearRampToValueAtTime(38, now + 0.65);
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.72);
    duration = 0.72;
  } else if (type === 'audio') {
    [261.63, 329.63, 392.0, 523.25].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.08);
      gain.gain.setValueAtTime(0.22, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.55);
      osc.connect(gain);
      gain.connect(out);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.58);
    });
    duration = 0.85;
  } else if (type === 'ultra') {
    // High sonar chirp representing > 20.000 Hz echolocation
    [0, 0.18, 0.36].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(3600, now + offset);
      osc.frequency.exponentialRampToValueAtTime(4800, now + offset + 0.07);
      gain.gain.setValueAtTime(0.14, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
      osc.connect(gain);
      gain.connect(out);
      osc.start(now + offset);
      osc.stop(now + offset + 0.12);
    });
    duration = 0.52;
  }

  activeSoundEndTime = Math.max(activeSoundEndTime, now + duration);
}

export function playBottleNote(bottleIndex: number, mode: 'Ketuk Botol' | 'Tiup Botol', enabled = true): number {
  // Physics:
  // Ketuk Botol (tapping glass): more water = heavier vibrating system = LOWER pitch
  // Tiup Botol (blowing across top): more water = shorter air column = HIGHER pitch
  const strikeFreqs = [392.0, 440.0, 523.25, 587.33, 659.25]; // 85% water (low) -> 20% water (high)
  const blowFreqs = [659.25, 587.33, 523.25, 440.0, 392.0];   // 85% water (high) -> 20% water (low)
  const freq = mode === 'Ketuk Botol' ? strikeFreqs[bottleIndex] : blowFreqs[bottleIndex];

  if (!enabled) return freq;
  const setup = ensureAudio();
  if (!setup) return freq;
  const { ctx, out } = setup;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = mode === 'Ketuk Botol' ? 'sine' : 'triangle';
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
  osc.connect(gain);
  gain.connect(out);
  osc.start(now);
  osc.stop(now + 0.68);
  activeSoundEndTime = Math.max(activeSoundEndTime, now + 0.65);
  return freq;
}
