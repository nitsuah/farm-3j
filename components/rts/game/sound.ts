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
  // Achievement unlock — ascending chime
  achievementUnlock: () => {
    playTone(523, 0.1, 0.13, 'sine');
    window.setTimeout(() => playTone(659, 0.1, 0.12, 'sine'), 90);
    window.setTimeout(() => playTone(784, 0.1, 0.11, 'sine'), 180);
    window.setTimeout(() => playTone(1047, 0.3, 0.1, 'sine'), 270);
  },
  // Warchief stomp roar — low thud + rising screech
  warchiefStomp: () => {
    playTone(60, 0.15, 0.2, 'sawtooth', 40);
    playTone(120, 0.12, 0.13, 'square', 80);
    window.setTimeout(() => playTone(300, 0.2, 0.1, 'sawtooth', 600), 120);
  },
  // Warlord War Cry — dramatic horn blast
  warlordWarCry: () => {
    playTone(196, 0.15, 0.18, 'sawtooth');
    window.setTimeout(() => playTone(220, 0.15, 0.16, 'sawtooth'), 100);
    window.setTimeout(() => playTone(262, 0.25, 0.14, 'sawtooth', 330), 200);
    window.setTimeout(() => playTone(330, 0.3, 0.12, 'sawtooth', 196), 350);
  },
  // Warlord Shield Bash — impact clang
  warlordShieldBash: () => {
    playTone(400, 0.04, 0.22, 'square', 80);
    playTone(250, 0.1, 0.15, 'square', 60);
  },
  // Night Lurker shriek — high-pitched eerie screech
  lurkerShriek: () => {
    playTone(1200, 0.06, 0.08, 'sine', 600);
    window.setTimeout(() => playTone(900, 0.05, 0.12, 'sine', 300), 60);
    window.setTimeout(() => playTone(600, 0.04, 0.1, 'sine', 200), 130);
  },
  // Goblin Sapper tick — rhythmic bomb countdown beep
  sapperTick: () => {
    playTone(1400, 0.04, 0.18, 'square');
    window.setTimeout(() => playTone(1400, 0.04, 0.18, 'square'), 200);
    window.setTimeout(() => playTone(1600, 0.06, 0.2, 'square'), 400);
  },
};

// ---------- Ambient audio loop ----------
// Uses Web Audio noise + filters for wind, and periodic chirp tones for birds/crickets.

let _ambientNodes: AudioNode[] = [];
let _ambientIntervalId: ReturnType<typeof setInterval> | null = null;
let _ambientNight = false;

function createNoiseSource(
  ctx: AudioContext,
  bufferSize = 2
): AudioBufferSourceNode {
  const sampleRate = ctx.sampleRate;
  const frames = Math.ceil(sampleRate * bufferSize);
  const buf = ctx.createBuffer(1, frames, sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  return src;
}

export function startAmbient(isNight: boolean): void {
  if (_soundMuted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  // Avoid recreating if already running in same mode
  if (_ambientNodes.length > 0 && _ambientNight === isNight) return;
  stopAmbient();
  _ambientNight = isNight;

  // Wind: white noise → low-pass filter
  const noise = createNoiseSource(ctx);
  const lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = isNight ? 120 : 200;
  lpf.Q.value = 0.5;
  const windGain = ctx.createGain();
  windGain.gain.value = isNight ? 0.03 : 0.045;
  noise.connect(lpf);
  lpf.connect(windGain);
  windGain.connect(ctx.destination);
  noise.start();
  _ambientNodes.push(noise, lpf, windGain);

  // Periodic bird chirps (day) or cricket pulses (night)
  _ambientIntervalId = setInterval(
    () => {
      if (_soundMuted) return;
      const ctx2 = getAudioCtx();
      if (!ctx2) return;
      if (isNight) {
        // Cricket-like: rapid high-freq pulse burst
        const rate = 3800 + Math.random() * 400;
        for (let i = 0; i < 4; i++) {
          window.setTimeout(() => playTone(rate, 0.04, 0.015, 'sine'), i * 55);
        }
      } else {
        // Bird chirp: short ascending sweep
        const base = 1400 + Math.random() * 600;
        playTone(base, 0.12, 0.022, 'sine', base * 1.5);
      }
    },
    isNight ? 800 : 3500 + Math.random() * 2000
  );
}

export function stopAmbient(): void {
  if (_ambientIntervalId !== null) {
    clearInterval(_ambientIntervalId);
    _ambientIntervalId = null;
  }
  _ambientNodes.forEach(n => {
    try {
      (n as AudioScheduledSourceNode).stop?.();
      n.disconnect();
    } catch {
      /* already stopped */
    }
  });
  _ambientNodes = [];
}

// Unit acknowledgement voice lines — WC3-style responses on command
export const ACK_MOVE: Record<string, string[]> = {
  farmer: [
    'On my way!',
    'Right away!',
    'Yes sir!',
    'Moving out!',
    'As you wish!',
    'Coming!',
    'Got it!',
    'Sure thing!',
  ],
  swordsman: [
    'For the farm!',
    'Moving out!',
    'At once!',
    'Aye!',
    'Steel ready!',
    'March!',
    'With honour!',
    'On the move!',
  ],
  cavalry: [
    'Ride out!',
    'Full gallop!',
    'On it!',
    'Charging!',
    'To battle!',
    'Hooves away!',
    'Flying!',
  ],
  hero: [
    'Barnabas rides!',
    'Lead the way!',
    'For glory!',
    'With honour!',
    'This way!',
    'To the front!',
    'Advancing!',
  ],
  catapult: ['Repositioning!', 'Loading up!', 'Moving!', 'New angle!'],
  trebuchet: ['Advancing!', 'New position!', 'Moving range!', 'Changing post!'],
};
export const ACK_ATTACK: Record<string, string[]> = {
  farmer: [
    "I'll try!",
    'For the farm!',
    'Defending!',
    'Protecting us!',
    "They won't pass!",
  ],
  swordsman: [
    'Attack!',
    'Charging!',
    "They'll pay!",
    'Engage!',
    'Strike!',
    'Cut them down!',
    'For the barn!',
  ],
  cavalry: [
    'Trample them!',
    'Charge!!',
    'Crush them!',
    'Run them down!',
    'Lance out!',
  ],
  hero: [
    'Taste steel!',
    'You dare?!',
    'For glory!',
    'Fall before me!',
    'The hero strikes!',
    'Begone, fiend!',
  ],
  catapult: ['Fire!', 'Launching!', 'Boulders away!', 'Target acquired!'],
  trebuchet: ['Incoming!', 'Fire for effect!', 'Bombarding!'],
};

// Enemy alert voice lines (floating text shown on enemy ability use)
export const ENEMY_VOICELINES: Record<string, string[]> = {
  warchief_stomp: [
    '⚔ WARCHIEF: Kneel before me!',
    '⚔ WARCHIEF: STOMP!',
    '⚔ WARCHIEF: Feel the earth shake!',
    '⚔ WARCHIEF: Puny farmers!',
  ],
  warlord_warcry: [
    '⚔ WARLORD: WAR CRY!',
    '⚔ WARLORD: To victory!',
    '⚔ WARLORD: Fight to the last!',
    '⚔ WARLORD: No mercy!',
  ],
  warlord_bash: [
    '⚔ WARLORD: Shield Bash!',
    '⚔ WARLORD: Take that, hero!',
    '⚔ WARLORD: Back down, whelp!',
  ],
  sapper_incoming: [
    '💣 SAPPER: Tick tick tick...',
    '💣 SAPPER: Hehehehe... BOOM!',
    '💣 SAPPER: Nothing can stop me now!',
    '💣 SAPPER: Say goodbye to your walls!',
  ],
  witch_doctor: [
    '🔮 WITCH DOCTOR: Hex them all!',
    '🔮 WITCH DOCTOR: Grow stronger, brothers!',
    '🔮 WITCH DOCTOR: Enrage!',
  ],
  necromancer: [
    '💀 NECROMANCER: Rise from the grave!',
    '💀 NECROMANCER: Walk again!',
    '💀 NECROMANCER: The dead serve me!',
  ],
};
export function pickAck(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)] ?? '';
}
