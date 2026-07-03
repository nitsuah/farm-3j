// Web Audio sound helpers — procedural tones, no audio files required.
// Also holds unit acknowledgement voice lines (WC3-style responses on command).

let _audioCtx: AudioContext | null = null;
let _soundMuted = (() => {
  try {
    return localStorage.getItem('farm3j_muted') === '1';
  } catch {
    /* SSR/private mode */ return false;
  }
})();
let _lastGoldSnd = 0;
export function getSoundMuted() {
  return _soundMuted;
}
export function setSoundMuted(v: boolean) {
  _soundMuted = v;
  try {
    localStorage.setItem('farm3j_muted', v ? '1' : '0');
  } catch {
    /* ignore storage errors */
  }
}
function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!_audioCtx || _audioCtx.state === 'closed')
    _audioCtx = new AudioContext();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}
export function playTone(
  freq: number,
  duration: number,
  vol = 0.18,
  type: OscillatorType = 'square',
  freqEnd?: number
): void {
  if (_soundMuted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (freqEnd !== undefined)
    osc.frequency.linearRampToValueAtTime(freqEnd, ctx.currentTime + duration);
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}
export const Snd = {
  select: () => playTone(880, 0.08, 0.12, 'sine'),
  move: () => playTone(660, 0.1, 0.1, 'sine', 720),
  attack: () => {
    playTone(220, 0.06, 0.15, 'sawtooth');
    playTone(180, 0.1, 0.08, 'square');
  },
  hit: () => playTone(140, 0.05, 0.12, 'square', 80),
  death: () => {
    playTone(300, 0.08, 0.14, 'sawtooth', 100);
  },
  buildComplete: () => {
    playTone(523, 0.1, 0.14, 'sine');
    playTone(659, 0.14, 0.12, 'sine');
    playTone(784, 0.2, 0.1, 'sine');
  },
  // Throttled to once per 2s so it doesn't spam on every deposit
  gold: () => {
    const now = Date.now();
    if (now - _lastGoldSnd < 2000) return;
    _lastGoldSnd = now;
    playTone(1047, 0.12, 0.1, 'sine', 1319);
  },
  waveWarning: () => {
    playTone(220, 0.2, 0.16, 'sawtooth');
    playTone(196, 0.3, 0.12, 'sawtooth');
  },
  victory: () => {
    playTone(523, 0.12, 0.15, 'sine');
    playTone(659, 0.16, 0.13, 'sine');
    playTone(784, 0.2, 0.11, 'sine');
    playTone(1047, 0.4, 0.1, 'sine');
  },
  defeat: () => {
    playTone(392, 0.2, 0.14, 'sawtooth', 220);
    playTone(220, 0.4, 0.12, 'sawtooth', 110);
  },
  unitReady: () => {
    playTone(587, 0.08, 0.12, 'sine');
    playTone(784, 0.14, 0.1, 'sine');
  },
  ability: () => {
    playTone(440, 0.06, 0.14, 'sine');
    playTone(660, 0.12, 0.12, 'sine', 880);
  },
  garrison: () => playTone(330, 0.1, 0.11, 'sine', 440),
  charge: () => {
    playTone(330, 0.05, 0.16, 'sawtooth');
    playTone(494, 0.1, 0.14, 'sawtooth');
  },
  error: () => playTone(220, 0.08, 0.1, 'square', 180),
};

// Unit acknowledgement voice lines — WC3-style responses on command
export const ACK_MOVE: Record<string, string[]> = {
  farmer: [
    'On my way!',
    'Right away!',
    'Yes sir!',
    'Moving out!',
    'As you wish!',
  ],
  swordsman: [
    'For the farm!',
    'Moving out!',
    'At once!',
    'Aye!',
    'Steel ready!',
  ],
  cavalry: ['Ride out!', 'Full gallop!', 'On it!', 'Charging!', 'To battle!'],
  hero: ['Barnabas rides!', 'Lead the way!', 'For glory!', 'With honour!'],
  catapult: ['Repositioning!', 'Loading up!', 'Moving!'],
  trebuchet: ['Advancing!', 'New position!', 'Moving range!'],
};
export const ACK_ATTACK: Record<string, string[]> = {
  farmer: ["I'll try!", 'For the farm!', 'Defending!'],
  swordsman: ['Attack!', 'Charging!', "They'll pay!", 'Engage!'],
  cavalry: ['Trample them!', 'Charge!!', 'Crush them!'],
  hero: ['Taste steel!', 'You dare?!', 'For glory!'],
  catapult: ['Fire!', 'Launching!', 'Boulders away!'],
  trebuchet: ['Incoming!', 'Fire for effect!'],
};
export function pickAck(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)] ?? '';
}
