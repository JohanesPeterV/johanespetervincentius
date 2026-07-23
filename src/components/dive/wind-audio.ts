import { createSeededRandom } from './world-layout';

type WindEngine = {
  context: AudioContext;
  master: GainNode;
  filter: BiquadFilterNode;
  audible: boolean;
};

const NOISE_SECONDS = 3;
const BASE_LEVEL = 0.12;

let engine: WindEngine | null = null;

const buildNoiseBuffer = (context: AudioContext): AudioBuffer => {
  const length = context.sampleRate * NOISE_SECONDS;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const channel = buffer.getChannelData(0);
  const random = createSeededRandom(97);
  for (let index = 0; index < length; index++) {
    channel[index] = random() * 2 - 1;
  }
  return buffer;
};

const buildEngine = (): WindEngine => {
  const context = new AudioContext();
  const source = context.createBufferSource();
  source.buffer = buildNoiseBuffer(context);
  source.loop = true;
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 420;
  filter.Q.value = 0.9;
  const gust = context.createOscillator();
  gust.frequency.value = 0.12;
  const gustDepth = context.createGain();
  gustDepth.gain.value = 320;
  const master = context.createGain();
  master.gain.value = 0;
  gust.connect(gustDepth);
  gustDepth.connect(filter.detune);
  source.connect(filter);
  filter.connect(master);
  master.connect(context.destination);
  source.start();
  gust.start();
  return { context, master, filter, audible: false };
};

export const toggleWindAudio = (): 'on' | 'off' => {
  if (engine === null) {
    engine = buildEngine();
  }
  engine.audible = !engine.audible;
  const now = engine.context.currentTime;
  if (!engine.audible) {
    engine.master.gain.setTargetAtTime(0, now, 0.25);
    return 'off';
  }
  engine.context.resume();
  engine.master.gain.setTargetAtTime(BASE_LEVEL, now, 0.6);
  return 'on';
};

export const setWindDrive = (depth: number, rush: number): void => {
  if (engine === null || !engine.audible) {
    return;
  }
  const now = engine.context.currentTime;
  const level = Math.min(0.4, BASE_LEVEL + depth * 0.08 + rush * 0.22);
  engine.master.gain.setTargetAtTime(level, now, 0.35);
  const frequency = 320 + depth * 420 + rush * 1500;
  engine.filter.frequency.setTargetAtTime(frequency, now, 0.2);
};

export const disposeWindAudio = (): void => {
  if (engine === null) {
    return;
  }
  engine.master.disconnect();
  engine.filter.disconnect();
  engine.context.close();
  engine = null;
};
