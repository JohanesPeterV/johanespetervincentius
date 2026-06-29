import { atom, useAtomValue, useSetAtom } from 'jotai';

const wipeProgressAtom = atom(0);

// REASON: the world-two canvas runs MeshTransmissionMaterial plus an HDR environment, so it must stay paused while the intro hides it and only resume once the scroll wipe starts revealing it
const worldTwoActiveAtom = atom((get) => get(wipeProgressAtom) > 0.001);

// REASON: the live fog filter is heavy, so it only runs across the reveal band and switches off once world two has fully arrived
const worldTwoTransitioningAtom = atom((get) => {
  const wipe = get(wipeProgressAtom);
  return wipe > 0.001 && wipe < 0.92;
});

export function useSetWipeProgress() {
  return useSetAtom(wipeProgressAtom);
}

export function useWorldTwoActive() {
  return useAtomValue(worldTwoActiveAtom);
}

export function useWorldTwoTransitioning() {
  return useAtomValue(worldTwoTransitioningAtom);
}
