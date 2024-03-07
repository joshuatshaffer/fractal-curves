import { useAtom } from "jotai";
import { Vector2 } from "../Vector2";
import { generatorAtom } from "../atoms/atoms";

export function GeneratorEditor() {
  const [generator, setGenerator] = useAtom(generatorAtom);

  return (
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
                  const from = g[i - 1] ?? Vector2.zero;
                  const to = g[i];

                  const mid = Vector2.from(to).add(from).scale(0.5);

                  const newGenerator = [...g];
                  newGenerator.splice(i, 0, { ...to, ...mid });
                  return newGenerator;
                });
              }}
              title="Add control point"
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
                title="Remove control point"
              >
                -
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
