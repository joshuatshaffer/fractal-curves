import { useAtom, useAtomValue } from "jotai";
import { iterationsAtom, maxIterationsAtom } from "../atoms/atoms";

export function IterationsControl() {
  const [iterations, setIterations] = useAtom(iterationsAtom);
  const maxIterations = useAtomValue(maxIterationsAtom);

  return (
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
  );
}
