import { useState } from "react";
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

export function App() {
  const [generator, setGenerator] = useState<FractalCurveGenerator>([
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

          <Path points={generateFractalCurve(generator, 4)} />

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
