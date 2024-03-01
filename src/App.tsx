import { useMemo, useState } from "react";
import styles from "./App.module.scss";
import { Arrow, ArrowMarker } from "./Arrow";
import { ControlPoint } from "./ControlPoint";
import { Path } from "./Path";
import {
  FractalCurveGenerator,
  generateFractalCurve,
  getBaseLine,
  getLines,
  maxIterationsFromMaxPoints,
  scale,
  translate,
} from "./fractal";
import { useHashState } from "./useHashState";
import { ViewSettingsContextProvider } from "./viewSpace";

/**
 * Limit the number of points drawn to avoid crashing the browser.
 */
const maxPoints = 10_000;

export function App() {
  const [fillMode, setFillMode] = useState(true);
  const [iterations0, setIterations] = useState(4);
  const [generator, setGenerator] = useHashState<FractalCurveGenerator>([
    {
      reversed: false,
      x: 10,
      y: 0,
    },
    {
      reversed: true,
      x: 20,
      y: 10,
    },
    {
      reversed: false,
      x: 30,
      y: 0,
    },
    {
      reversed: false,
      x: 40,
      y: 0,
    },
  ]);

  const maxIterations = maxIterationsFromMaxPoints(maxPoints, generator);

  const iterations = Math.min(iterations0, maxIterations);

  const points = useMemo(
    () => generateFractalCurve(generator, iterations),
    [generator, iterations]
  );

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
      <ViewSettingsContextProvider
        value={{ scale: 10, translate: { x: 10, y: 250 } }}
      >
        <svg className={styles.view} style={{ width: "100%", height: "100vh" }}>
          <defs>
            <ArrowMarker />
          </defs>

          <Arrow {...getBaseLine(generator)} color="#ff000055" />

          {getLines(generator).map(({ from, to }, i) => (
            <Arrow key={i} from={from} to={to} color="#0000ff55" />
          ))}

          <Path points={points} fillMode={fillMode} />

          {generator.map((_, i) => (
            <ControlPoint
              key={i}
              generator={generator}
              setGenerator={setGenerator}
              index={i}
            />
          ))}
        </svg>
      </ViewSettingsContextProvider>
    </>
  );
}
