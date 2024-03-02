import { useMemo, useState } from "react";
import styles from "./App.module.scss";
import { Arrow, ArrowMarker } from "./Arrow";
import { ControlPoint } from "./ControlPoint";
import { Path } from "./Path";
import { eventXY } from "./eventXY";
import {
  FractalCurveGenerator,
  generateFractalCurve,
  getBaseLine,
  getLines,
  maxIterationsFromMaxPoints,
  scale,
  translate,
} from "./fractal";
import { onDrag } from "./onDrag";
import { useHashState } from "./useHashState";
import { ViewSettingsContextProvider } from "./viewSpace";

/**
 * Limit the number of points drawn to avoid crashing the browser.
 */
const maxPoints = 10_000;

export function App() {
  const [state, setState] = useHashState<{
    iterations: number;
    fillMode: boolean;
    generator: FractalCurveGenerator;
  }>({
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
  });

  const generator = state.generator;
  const setGenerator = (
    g:
      | FractalCurveGenerator
      | ((prev: FractalCurveGenerator) => FractalCurveGenerator)
  ) => {
    setState(
      typeof g === "function"
        ? (s) => ({ ...s, generator: g(s.generator) })
        : { ...state, generator: g }
    );
  };

  const maxIterations = maxIterationsFromMaxPoints(maxPoints, generator);

  const iterations = Math.min(state.iterations, maxIterations);
  const setIterations = (i: number) => {
    setState({ ...state, iterations: i });
  };

  const fillMode = state.fillMode;
  const setFillMode = (f: boolean) => {
    setState({ ...state, fillMode: f });
  };

  const points = useMemo(
    () => generateFractalCurve(generator, iterations),
    [generator, iterations]
  );

  const [viewSettings, setViewSettings] = useState({
    scale: 10,
    translate: { x: 10, y: 250 },
  });

  return (
    <>
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
      <ViewSettingsContextProvider value={viewSettings}>
        <svg
          className={styles.view}
          style={{ width: "100%", height: "100vh", touchAction: "none" }}
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
          <Arrow {...getBaseLine(generator)} color="#ff000055" />
          {getLines(generator).map(({ from, to }, i) => (
            <Arrow key={i} from={from} to={to} color="#0000ff55" />
          ))}
          <Path points={points} fillMode={fillMode} />

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
        </svg>
      </ViewSettingsContextProvider>
    </>
  );
}
