import { PrimitiveAtom, atom } from "jotai";
import { focusAtom } from "jotai-optics";
import { Vector2 } from "../Vector2";
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
const maxPoints = 100_000;

export const generatorAtom = focusAtom(hashStateAtom, (optic) =>
  optic.prop("generator")
);

export const maxIterationsAtom = atom((get) =>
  maxIterationsFromMaxPoints(maxPoints, get(generatorAtom))
);

type IterationsAnimationState =
  | { status: "stopped" }
  | {
      status: "running";
      startTime: number;
      totalTime: number;
      animationFrameId: number;
    };

const internalIterationsAtom = focusAtom(hashStateAtom, (optic) =>
  optic.path("iterations")
);

export const iterationsAnimationAtom = (() => {
  const a = atom<IterationsAnimationState>({
    status: "stopped",
  });

  return atom(
    (get) => get(a).status,
    (get, set, action: "start" | "stop") => {
      const update: FrameRequestCallback = (now) => {
        const state = get(a);

        if (state.status === "stopped") {
          return;
        }

        const elapsed = now - state.startTime;
        if (elapsed > state.totalTime) {
          set(internalIterationsAtom, get(maxIterationsAtom));
          set(a, { status: "stopped" });
          return;
        }
        set(
          internalIterationsAtom,
          Math.max(0, (elapsed / state.totalTime) * get(maxIterationsAtom))
        );
        set(a, {
          ...state,
          animationFrameId: requestAnimationFrame(update),
        });
      };

      const prevState = get(a);
      if (prevState.status === "running") {
        cancelAnimationFrame(prevState.animationFrameId);
      }

      if (action === "start") {
        set(internalIterationsAtom, 0);
        set(a, {
          status: "running",
          startTime: performance.now(),
          totalTime: 5000,
          animationFrameId: requestAnimationFrame(update),
        });
      } else {
        set(a, { status: "stopped" });
      }
    }
  );
})();

export const iterationsAtom: PrimitiveAtom<number> = atom(
  (get) => Math.min(get(maxIterationsAtom), get(internalIterationsAtom)),
  (_get, set, update) => {
    // Stop the animation when a user manually changes the iterations.
    set(iterationsAnimationAtom, "stop");

    set(internalIterationsAtom, update);
  }
);

export const renderModeAtom = focusAtom(hashStateAtom, (optic) =>
  optic.prop("renderMode")
);

export const pointsAtom = atom((get) =>
  generateFractalCurve(get(generatorAtom), get(iterationsAtom))
);

export const viewSettingsAtom = atom<ViewSettings>({
  scale: 1,
  translate: Vector2.zero,
});

export const showControlOverlayAtom = atom(false);

export const normalizeViewAtom = atom(null, (get, set) => {
  const windowSize = new Vector2(window.innerWidth, window.innerHeight);

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

  const scale = Math.min((windowSize.x - 20) / dx, (windowSize.y - 20) / dy);

  set(viewSettingsAtom, {
    scale: scale,
    translate: windowSize
      .subtract(new Vector2(maxX + minX, maxY + minY).scale(scale))
      .scale(1 / 2),
  });
});

export const loadGeneratorAtom = atom(
  null,
  (_get, set, generator: FractalCurveGenerator) => {
    set(generatorAtom, generator);
    set(normalizeViewAtom);
    set(iterationsAnimationAtom, "start");
  }
);
