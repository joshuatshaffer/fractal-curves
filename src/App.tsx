import styles from "./App.module.scss";
import { Arrow, ArrowMarker } from "./Arrow";
import { Path } from "./Path";
import {
  FractalCurveGenerator,
  generateFractalCurve,
  getBaseLine,
  getLines,
} from "./fractal";
import { ViewSettingsContextProvider } from "./viewSpace";
import { ControlPoint } from "./ControlPoint";
import { useHashState } from "./useHashState";
import { useState } from "react";

export function App() {
  const [iterations, setIterations] = useState(4);
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

  return (
    <>
      <div>
        <label htmlFor="iterations-input">Iterations </label>
        <input
          id="iterations-input"
          type="number"
          min={0}
          max={5}
          value={iterations}
          onChange={(e) => {
            setIterations(Number(e.target.value));
          }}
        />
        <input
          id="iterations-slider"
          type="range"
          min={0}
          max={5}
          step={0.1}
          value={iterations}
          onChange={(e) => {
            setIterations(Number(e.target.value));
          }}
        />
      </div>
      <ViewSettingsContextProvider
        value={{ scale: 10, translate: { x: 10, y: 250 } }}
      >
        <svg
          className={styles.view}
          viewBox="0 0 500 500"
          width={500}
          height={500}
        >
          <defs>
            <ArrowMarker />
          </defs>

          <Arrow {...getBaseLine(generator)} color="#ff000055" />

          {getLines(generator).map(({ from, to }, i) => (
            <Arrow key={i} from={from} to={to} color="#0000ff55" />
          ))}

          <Path points={generateFractalCurve(generator, iterations)} />

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
