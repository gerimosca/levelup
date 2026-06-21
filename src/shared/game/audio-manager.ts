/**
 * audio-manager — SFX sintetizados con Web Audio API.
 * Sin archivos externos. Cada sonido es una secuencia de notas programadas.
 */
export type SfxKey =
  | 'claim'
  | 'levelUp'
  | 'tierUp'
  | 'missionComplete'
  | 'chest'
  | 'petEvolve'
  | 'enemyHit'
  | 'seasonEnd'
  | 'streakMilestone'
  | 'tap';

type OscType = OscillatorType;
type Step = [freqHz: number, durSec: number];

const SFX: Record<SfxKey, { steps: Step[]; type?: OscType; gain?: number }> = {
  tap:             { steps: [[800, 0.04]],                                                            type: 'triangle', gain: 0.18 },
  claim:           { steps: [[523, 0.08], [659, 0.08], [784, 0.18]],                                 gain: 0.22 },
  enemyHit:        { steps: [[180, 0.15], [90, 0.1]],                                                type: 'sawtooth', gain: 0.14 },
  missionComplete: { steps: [[262, 0.07], [330, 0.07], [392, 0.07], [523, 0.22]],                    gain: 0.22 },
  chest:           { steps: [[1047, 0.05], [1319, 0.05], [1568, 0.05], [1976, 0.12]],                gain: 0.18 },
  levelUp:         { steps: [[262, 0.07], [330, 0.07], [392, 0.07], [523, 0.07], [784, 0.22]],       gain: 0.22 },
  tierUp:          { steps: [[196, 0.08], [247, 0.08], [330, 0.08], [392, 0.08], [523, 0.08], [784, 0.28]], type: 'triangle', gain: 0.22 },
  petEvolve:       { steps: [[784, 0.05], [988, 0.05], [1175, 0.05], [1568, 0.12]],                  gain: 0.18 },
  seasonEnd:       { steps: [[262, 0.08], [330, 0.08], [392, 0.08], [523, 0.08], [659, 0.08], [784, 0.08], [1047, 0.35]], gain: 0.22 },
  streakMilestone: { steps: [[330, 0.06], [440, 0.06], [554, 0.06], [659, 0.06], [880, 0.06], [1047, 0.08], [1319, 0.32]], type: 'triangle', gain: 0.24 },
};

class AudioManager {
  private ctx: AudioContext | null = null;
  private enabled = true;

  setEnabled(value: boolean) {
    this.enabled = value;
  }

  play(key: SfxKey, volume = 0.6) {
    if (!this.enabled || typeof window === 'undefined') return;
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)();
      }
      const ctx = this.ctx;
      if (ctx.state === 'suspended') void ctx.resume();

      const { steps, type = 'sine', gain = 0.22 } = SFX[key];
      const masterGain = volume * gain;
      let offset = 0;

      for (const [freq, dur] of steps) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g);
        g.connect(ctx.destination);
        osc.type = type;

        const t0 = ctx.currentTime + offset;
        const attack = 0.01;
        const release = Math.min(0.04, dur * 0.3);

        osc.frequency.setValueAtTime(freq, t0);
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(masterGain, t0 + attack);
        g.gain.setValueAtTime(masterGain, t0 + dur - release);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

        osc.start(t0);
        osc.stop(t0 + dur + 0.01);

        offset += dur;
      }
    } catch {
      /* autoplay bloqueado o entorno sin audio: no-op */
    }
  }
}

export const audio = new AudioManager();
