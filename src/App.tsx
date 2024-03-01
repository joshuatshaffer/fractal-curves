import { useState } from "react";
import styles from "./App.module.scss";
import { Arrow, ArrowMarker } from "./Arrow";
import {
  FractalCurveGenerator,
  generateFractalCurve,
  getBaseLine,
  getLines,
} from "./fractal";
import { Path } from "./Path";
import { ViewSettingsContextProvider } from "./viewSpace";

export function App() {
  const [generator] = useState<FractalCurveGenerator>([
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
      <ViewSettingsContextProvider
        value={{ scale: 3, translate: { x: 10, y: 50 } }}
      >
        <svg className={styles.view} viewBox="0 0 300 100">
          <defs>
            <ArrowMarker />
          </defs>

          <Arrow {...getBaseLine(generator)} color="#ff000055" />

          {getLines(generator).map(({ from, to }, i) => (
            <Arrow key={i} from={from} to={to} color="#0000ff55" />
          ))}

          <Path points={generateFractalCurve(generator, 4)} />
        </svg>
      </ViewSettingsContextProvider>
    </>
  );
}
