import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import styles from "./App.module.scss";
import { Arrow, ArrowMarker } from "./Arrow";
import { ControlPoint } from "./ControlPoint";
import { Path } from "./Path";
import {
  fillModeAtom,
  generatorAtom,
  iterationsAnimationAtom,
  iterationsAtom,
  loadGeneratorAtom,
  maxIterationsAtom,
  normalizeViewAtom,
  pointsAtom,
  svgElementAtom,
  viewSettingsAtom,
} from "./atoms/atoms";
import { eventXY } from "./eventXY";
import { dragon, snowflakeSweep } from "./exampleFractalCurves";
import { getBaseLine, getLines, scale, translate } from "./fractal";
import { onDrag } from "./onDrag";

export function App() {
  const [generator, setGenerator] = useAtom(generatorAtom);

  const [iterations, setIterations] = useAtom(iterationsAtom);
  const maxIterations = useAtomValue(maxIterationsAtom);

  const [fillMode, setFillMode] = useAtom(fillModeAtom);

  const points = useAtomValue(pointsAtom);

  const [viewSettings, setViewSettings] = useAtom(viewSettingsAtom);

  const [svgElement, setSvgElement] = useAtom(svgElementAtom);

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

  const normalizeView = useSetAtom(normalizeViewAtom);

  // Normalize view on page load.
  useEffect(() => {
    normalizeView();
  }, [normalizeView]);

  const loadGenerator = useSetAtom(loadGeneratorAtom);

  const [iterationsAnimation, setIterationsAnimation] = useAtom(
    iterationsAnimationAtom
  );

  return (
    <>
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
          <ControlPoint index={-1} />
          {generator.map((_, i) => (
            <ControlPoint key={i} index={i} />
          ))}
        </g>
      </svg>
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
              <br />
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
                style={{ width: "100%" }}
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
              <label htmlFor="animate-checkbox">Animate </label>
              <input
                id="animate-checkbox"
                type="checkbox"
                checked={iterationsAnimation === "running"}
                onChange={(e) => {
                  setIterationsAnimation(
                    e.target.checked ? "running" : "stopped"
                  );
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
            {[dragon, snowflakeSweep].map((example) => (
              <button
                key={example.name}
                type="button"
                onClick={() => {
                  loadGenerator(example.generator);
                }}
              >
                {example.name}
              </button>
            ))}
          </div>
        </details>
      </div>
    </>
  );
}
