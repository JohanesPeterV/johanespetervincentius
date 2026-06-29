import { atom, useAtomValue, useSetAtom } from 'jotai';

const wipeProgressAtom = atom(0);

// REASON: the world-two canvas runs MeshTransmissionMaterial plus an HDR environment, so it must stay paused while the intro hides it and only resume once the scroll wipe starts revealing it
const worldTwoActiveAtom = atom((get) => get(wipeProgressAtom) > 0.001);

export function useSetWipeProgress() {
  return useSetAtom(wipeProgressAtom);
}

export function useWorldTwoActive() {
  return useAtomValue(worldTwoActiveAtom);
}
