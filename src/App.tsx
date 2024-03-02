import { useAtom, useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useEffect, useState } from "react";
import styles from "./App.module.scss";
import { Arrow, ArrowMarker } from "./Arrow";
import { ControlPoint } from "./ControlPoint";
import { Path } from "./Path";
import {
  fillModeAtom,
  generatorAtom,
  iterationsAtom,
  maxIterationsAtom,
  pointsAtom,
  viewSettingsAtom,
} from "./atoms";
import { eventXY } from "./eventXY";
import {
  FractalCurveGenerator,
  generateFractalCurve,
  getBaseLine,
  getLines,
  scale,
  translate,
} from "./fractal";
import { onDrag } from "./onDrag";
import { ViewSettingsContextProvider } from "./viewSpace";

const dragonGenerator: FractalCurveGenerator = [
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
];

function triLattice(x: number, y: number) {
  return {
    x: (x + y / 2) * 10,
    y: -y * (Math.sqrt(3) / 2) * 10,
  };
}

const snowflakeSweepGenerator: FractalCurveGenerator = [
  {
    ...triLattice(0, 1),
    reversed: true,
  },
  {
    ...triLattice(0, 2),
    reversed: false,
  },
  {
    ...triLattice(1, 2),
    reversed: false,
  },
  {
    ...triLattice(2, 1),
    reversed: false,
  },
  {
    ...triLattice(1, 0),
    reversed: true,
  },
  {
    ...triLattice(2, 0),
    reversed: true,
  },
  {
    ...triLattice(3, 0),
    reversed: false,
  },
];

export function App() {
  const [generator, setGenerator] = useAtom(generatorAtom);

  const [iterations, setIterations] = useAtom(iterationsAtom);
  const maxIterations = useAtomValue(maxIterationsAtom);

  const [fillMode, setFillMode] = useAtom(fillModeAtom);

  const points = useAtomValue(pointsAtom);

  const [viewSettings, setViewSettings] = useAtom(viewSettingsAtom);

  const [svgElement, setSvgElement] = useState<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgElement) {
      return;
    }

    const listener = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      // TODO: Stay centered on the mouse position.
      setViewSettings((prev) => ({
        ...prev,
        scale: prev.scale * 2 ** (event.deltaY * 0.01),
      }));
    };

    svgElement.addEventListener("wheel", listener);
    return () => {
      svgElement.removeEventListener("wheel", listener);
    };
  }, [setViewSettings, svgElement]);

  const normalizeView = useAtomCallback((get, set) => {
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

  return (
    <>
      <ViewSettingsContextProvider value={viewSettings}>
        <svg
          ref={setSvgElement}
          className={styles.view}
          {...onDrag((event) => {
            const start = eventXY(event);
            return {
              onDragMove: (event) => {
                const current = eventXY(event);
                const dx = current.x - start.x;
                const dy = current.y - start.y;

                setViewSettings({
                  ...viewSettings,
                  translate: {
                    x: viewSettings.translate.x + dx,
                    y: viewSettings.translate.y + dy,
                  },
                });
              },
            };
          })}
        >
          <defs>
            <ArrowMarker />
          </defs>
          <Path points={points} fillMode={fillMode} />

          <g className={styles.controls}>
            <Arrow {...getBaseLine(generator)} color="#ff0000" />
            {getLines(generator).map(({ from, to }, i) => (
              <Arrow key={i} from={from} to={to} color="#0000ff" />
            ))}
            <ControlPoint
              generator={generator}
              setGenerator={setGenerator}
              viewSettings={viewSettings}
              setViewSettings={setViewSettings}
              index={-1}
            />
            {generator.map((_, i) => (
              <ControlPoint
                key={i}
                generator={generator}
                setGenerator={setGenerator}
                viewSettings={viewSettings}
                setViewSettings={setViewSettings}
                index={i}
              />
            ))}
          </g>
        </svg>
      </ViewSettingsContextProvider>
      <div className={styles.settingsContainer}>
        <details>
          <summary>Settings</summary>
          <div>
            <button
              type="button"
              onClick={() => {
                normalizeView();
              }}
            >
              Fit curve in view
            </button>
            <div>
              <label htmlFor="iterations-input">Iterations </label>
              <input
                id="iterations-input"
                type="number"
                min={0}
                max={maxIterations}
                value={iterations}
                onChange={(e) => {
                  setIterations(Number(e.target.value));
                }}
              />
              <input
                id="iterations-slider"
                type="range"
                min={0}
                max={maxIterations}
                step={0.1}
                value={iterations}
                onChange={(e) => {
                  setIterations(Number(e.target.value));
                }}
              />
            </div>
            <div>
              <label htmlFor="fill-checkbox">Fill </label>
              <input
                id="fill-checkbox"
                type="checkbox"
                checked={fillMode}
                onChange={(e) => {
                  setFillMode(e.target.checked);
                }}
              />
            </div>
            <div>
              <div>
                <input type="number" value={0} readOnly disabled />
                <input type="number" value={0} readOnly disabled />
              </div>
              {generator.map((p, i) => (
                <div key={i}>
                  <div>
                    <input
                      type="checkbox"
                      checked={p.reversed}
                      onChange={(e) => {
                        setGenerator((g) =>
                          g.map((p, j) =>
                            i === j ? { ...p, reversed: e.target.checked } : p
                          )
                        );
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setGenerator((g) => {
                          const from = g[i - 1] ?? { x: 0, y: 0 };
                          const to = g[i];

                          const mid = scale(translate(to, from), 0.5);

                          const newGenerator = [...g];
                          newGenerator.splice(i, 0, { ...to, ...mid });
                          return newGenerator;
                        });
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={p.x}
                      onChange={(e) => {
                        setGenerator((g) =>
                          g.map((p, j) =>
                            i === j ? { ...p, x: Number(e.target.value) } : p
                          )
                        );
                      }}
                    />
                    <input
                      type="number"
                      value={p.y}
                      onChange={(e) => {
                        setGenerator((g) =>
                          g.map((p, j) =>
                            i === j ? { ...p, y: Number(e.target.value) } : p
                          )
                        );
                      }}
                    />
                    {generator.length > 2 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setGenerator((g) => {
                            const newGenerator = [...g];
                            newGenerator.splice(i, 1);
                            return newGenerator;
                          });
                        }}
                      >
                        -
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </details>
        <details>
          <summary>Examples</summary>
          <div>
            <button
              type="button"
              onClick={() => {
                setGenerator(dragonGenerator);
                normalizeView();
              }}
            >
              Dragon
            </button>
            <button
              type="button"
              onClick={() => {
                setGenerator(snowflakeSweepGenerator);
                normalizeView();
              }}
            >
              Snowflake Sweep
            </button>
          </div>
        </details>
      </div>
    </>
  );
}
