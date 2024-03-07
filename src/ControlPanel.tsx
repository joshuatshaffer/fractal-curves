import { useAtom, useAtomValue, useSetAtom } from "jotai";
import styles from "./App.module.scss";
import { GeneratorEditor } from "./GeneratorEditor";
import {
  iterationsAnimationAtom,
  iterationsAtom,
  loadGeneratorAtom,
  maxIterationsAtom,
  normalizeViewAtom,
  renderModeAtom,
} from "./atoms/atoms";
import {
  dragon,
  gosperCurve,
  sierpinskiArrowhead,
  snowflakeSweep,
} from "./exampleFractalCurves";

export function ControlPanel() {
  const [iterations, setIterations] = useAtom(iterationsAtom);
  const maxIterations = useAtomValue(maxIterationsAtom);

  const [renderMode, setRenderMode] = useAtom(renderModeAtom);

  const loadGenerator = useSetAtom(loadGeneratorAtom);

  const [iterationsAnimation, setIterationsAnimation] = useAtom(
    iterationsAnimationAtom
  );

  const normalizeView = useSetAtom(normalizeViewAtom);

  return (
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
          <fieldset>
            <legend>Render mode</legend>
            {(
              [
                { value: "line", label: "Line" },
                { value: "fill", label: "Fill" },
                { value: "gradient", label: "Gradient" },
              ] as const
            ).map(({ value, label }) => (
              <span key={value}>
                <input
                  id={`render-mode-${value}`}
                  type="radio"
                  value={value}
                  checked={renderMode === value}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setRenderMode(value);
                    }
                  }}
                />
                <label htmlFor={`render-mode-${value}`}>{label}</label>
              </span>
            ))}
          </fieldset>
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
          <GeneratorEditor />
        </div>
      </details>
      <details>
        <summary>Examples</summary>
        <div>
          {[dragon, snowflakeSweep, gosperCurve, sierpinskiArrowhead].map(
            (example) => (
              <button
                key={example.name}
                type="button"
                onClick={() => {
                  loadGenerator(example.generator);
                }}
              >
                {example.name}
              </button>
            )
          )}
        </div>
      </details>
    </div>
  );
}
