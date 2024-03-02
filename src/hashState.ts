import { PrimitiveAtom, atom } from "jotai";
import { atomEffect } from "jotai-effect";
import { FractalCurveGenerator } from "./fractal";

export interface HashState {
  iterations: number;
  fillMode: boolean;
  generator: FractalCurveGenerator;
}

const internalHashStateAtom: PrimitiveAtom<HashState> = atom(
  (() => {
    const value = window.location.hash.slice(1);

    if (value) {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch (e) {
        console.error("Unable to page URL hash state", e);
      }
    }

    return {
      iterations: 4,
      fillMode: false,
      generator: [
        {
          reversed: true,
          x: 10,
          y: 0,
        },
        {
          reversed: false,
          x: 10,
          y: 10,
        },
      ],
    };
  })()
);

const hashStateUpdateEffectAtom = atomEffect((get) => {
  const hashState = get(internalHashStateAtom);

  const timeout = setTimeout(() => {
    window.location.hash = encodeURIComponent(JSON.stringify(hashState));
  }, 500);

  return () => {
    clearTimeout(timeout);
  };
});

export const hashStateAtom: PrimitiveAtom<HashState> = atom(
  (get) => {
    get(hashStateUpdateEffectAtom);
    return get(internalHashStateAtom);
  },
  (_get, set, update) => set(internalHashStateAtom, update)
);
