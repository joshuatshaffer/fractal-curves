import { PrimitiveAtom, atom } from "jotai";
import { focusAtom } from "jotai-optics";
import { generateFractalCurve, maxIterationsFromMaxPoints } from "./fractal";
import { hashStateAtom } from "./hashState";
import { ViewSettings } from "./viewSpace";

/**
 * Limit the number of points drawn to avoid crashing the browser.
 */
const maxPoints = 10_000;

export const generatorAtom = focusAtom(hashStateAtom, (optic) =>
  optic.prop("generator")
);

export const maxIterationsAtom = atom((get) =>
  maxIterationsFromMaxPoints(maxPoints, get(generatorAtom))
);

export const iterationsAtom = atom(
  (get) => Math.min(get(maxIterationsAtom), get(hashStateAtom).iterations),
  (get, set, iterations: number) =>
    set(hashStateAtom, { ...get(hashStateAtom), iterations })
);

export const fillModeAtom = focusAtom(hashStateAtom, (optic) =>
  optic.prop("fillMode")
);

export const pointsAtom = atom((get) =>
  generateFractalCurve(get(hashStateAtom).generator, get(iterationsAtom))
);

export const viewSettingsAtom: PrimitiveAtom<ViewSettings> = atom({
  scale: 10,
  translate: { x: 10, y: 250 },
});
