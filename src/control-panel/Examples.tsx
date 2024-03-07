import { useSetAtom } from "jotai";
import { loadGeneratorAtom } from "../atoms/atoms";
import {
  dragon,
  gosperCurve,
  sierpinskiArrowhead,
  snowflakeSweep,
} from "../exampleFractalCurves";

export function Examples() {
  const loadGenerator = useSetAtom(loadGeneratorAtom);

  return (
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
  );
}
