import { atom, PrimitiveAtom } from "jotai";
import { atomEffect } from "jotai-effect";
import { dragon } from "../exampleFractalCurves";
import {
  areFractalCurveGeneratorsEqual,
  FractalCurveGenerator,
} from "../fractal";

export interface HashState {
  iterations: number;
  renderMode: "line" | "fill" | "gradient";
  generator: FractalCurveGenerator;
}

const defaultHashState = {
  iterations: 4,
  renderMode: "line",
  generator: dragon.generator,
} as const;

function areHashStatesEqual(a: HashState, b: HashState) {
  return (
    a === b ||
    (a.iterations === b.iterations &&
      a.renderMode === b.renderMode &&
      areFractalCurveGeneratorsEqual(a.generator, b.generator))
  );
}

/**
 * @returns `undefined` when there is an error parsing the hash state.
 */
function readStateFromUrl(): HashState {
  const value = window.location.hash.slice(1);

  if (value) {
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch (error) {
      console.error("Unable to parse URL hash state", error);
    }
  }

  return defaultHashState;
}

function writeStateToUrl(state: HashState) {
  const prevState = readStateFromUrl();

  window.history[
    areHashStatesEqual(prevState, state) ? "replaceState" : "pushState"
  ](null, "", `#${encodeURIComponent(JSON.stringify(state))}`);

  // window.location.hash = encodeURIComponent(JSON.stringify(state));
}

const internalHashStateAtom: PrimitiveAtom<HashState> = atom(
  readStateFromUrl() ?? defaultHashState
);

const debounceTime = 500;

const hashStateWriteEffectAtom = atomEffect((get) => {
  const hashState = get(internalHashStateAtom);

  const timeout = setTimeout(() => {
    writeStateToUrl(hashState);
  }, debounceTime);

  return () => {
    clearTimeout(timeout);
  };
});

const hashStateReadEffectAtom = atomEffect((_get, set) => {
  const listener = () => {
    const s = readStateFromUrl();
    if (s !== undefined) {
      set(internalHashStateAtom, s);
    }
  };

  window.addEventListener("popstate", listener);
  return () => {
    window.removeEventListener("popstate", listener);
  };
});

export const hashStateAtom: PrimitiveAtom<HashState> = atom(
  (get) => {
    get(hashStateWriteEffectAtom);
    get(hashStateReadEffectAtom);
    return get(internalHashStateAtom);
  },
  (_get, set, update) => set(internalHashStateAtom, update)
);
