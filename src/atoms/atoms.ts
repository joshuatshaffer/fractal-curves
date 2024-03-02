import { PrimitiveAtom, atom } from "jotai";
import { atomEffect } from "jotai-effect";
import { focusAtom } from "jotai-optics";
import {
  FractalCurveGenerator,
  generateFractalCurve,
  maxIterationsFromMaxPoints,
} from "../fractal";
import { ViewSettings } from "../viewSpace";
import { hashStateAtom } from "./hashState";

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

type IterationsAnimationState =
  | { state: "stopped" }
  | { state: "running"; startTime: number; totalTime: number };

export const iterationsAnimationAtom = (() => {
  const a = atom<IterationsAnimationState>({
    state: "stopped",
  });

  return atom(
    (get) => get(a),
    (_get, set, update: IterationsAnimationState["state"]) =>
      set(
        a,
        update === "running"
          ? { state: "running", startTime: performance.now(), totalTime: 1000 }
          : { state: "stopped" }
      )
  );
})();

export const iterationsAtom: PrimitiveAtom<number> = (() => {
  const a = focusAtom(hashStateAtom, (optic) => optic.path("iterations"));

  const iterationsAnimationEffectAtom = atomEffect((get, set) => {
    console.log("iterationsAnimationEffectAtom");
    const update: FrameRequestCallback = (now) => {
      const state = get(iterationsAnimationAtom);
      if (state.state === "stopped") {
        return;
      }

      const elapsed = now - state.startTime;
      if (elapsed > state.totalTime) {
        set(iterationsAtom, get(maxIterationsAtom));
        set(iterationsAnimationAtom, "stopped");
        return;
      }
      set(iterationsAtom, (elapsed / state.totalTime) * get(maxIterationsAtom));
      rafId = requestAnimationFrame(update);
    };

    const state = get(iterationsAnimationAtom);
    if (state.state === "stopped") {
      return;
    }

    let rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
    };
  });

  return atom(
    (get) => {
      get(iterationsAnimationEffectAtom);
      return Math.min(get(maxIterationsAtom), get(a));
    },
    (_get, set, update) => set(a, update)
  );
})();

export const fillModeAtom = focusAtom(hashStateAtom, (optic) =>
  optic.prop("fillMode")
);

export const pointsAtom = atom((get) =>
  generateFractalCurve(get(hashStateAtom).generator, get(iterationsAtom))
);

export const viewSettingsAtom = atom<ViewSettings>({
  scale: 1,
  translate: { x: 0, y: 0 },
});

export const svgElementAtom = atom<SVGSVGElement | null>(null);

export const normalizeViewAtom = atom(null, (get, set) => {
  const svgElement = get(svgElementAtom);
  if (!svgElement) {
    return;
  }

  let minX = Infinity;
  let maxX = -Infinity;

  let minY = Infinity;
  let maxY = -Infinity;

  for (const p of generateFractalCurve(
    get(generatorAtom),
    get(maxIterationsAtom)
  )) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  const dx = maxX - minX;
  const dy = maxY - minY;

  const scale = Math.min(
    (svgElement.clientWidth - 20) / dx,
    (svgElement.clientHeight - 20) / dy
  );

  set(viewSettingsAtom, {
    scale: scale,
    translate: {
      x: (svgElement.clientWidth - (maxX + minX) * scale) / 2,
      y: (svgElement.clientHeight - (maxY + minY) * scale) / 2,
    },
  });
});

export const loadGeneratorAtom = atom(
  null,
  (get, set, generator: FractalCurveGenerator) => {
    set(generatorAtom, generator);
    set(iterationsAtom, get(maxIterationsAtom));
    set(normalizeViewAtom);
  }
);
