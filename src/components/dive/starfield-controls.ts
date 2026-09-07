import { atom } from 'jotai';

export const starfieldRequestAtom = atom(0);
export const starfieldStatusAtom = atom<'loading' | 'ready' | 'transitioning'>(
  'loading',
);

export const nextStarfieldFormationAtom = atom(null, (get, set) => {
  if (get(starfieldStatusAtom) !== 'ready') {
    return;
  }
  set(starfieldStatusAtom, 'transitioning');
  set(starfieldRequestAtom, get(starfieldRequestAtom) + 1);
});
