import { eventXY } from "./eventXY";
import { FractalCurveGenerator } from "./fractal";
import { onDrag } from "./onDrag";
import { usePointToSvg, useViewSettings } from "./viewSpace";

export function ControlPoint({
  generator,
  setGenerator,
  index,
}: {
  generator: FractalCurveGenerator;
  setGenerator: (generator: FractalCurveGenerator) => void;
  index: number;
}) {
  const viewSettings = useViewSettings();
  const pointToSvg = usePointToSvg();
  const point = pointToSvg(generator[index]);

  return (
    <circle
      style={{ touchAction: "none" }}
      {...onDrag((e) => {
        const start = eventXY(e);
        return {
          onDragMove: (e) => {
            const current = eventXY(e);
            const dx = (current.x - start.x) / viewSettings.scale;
            const dy = (current.y - start.y) / viewSettings.scale;
            setGenerator(
              generator.map((p, i) =>
                i === index ? { ...p, x: p.x + dx, y: p.y + dy } : p
              )
            );
          },
        };
      })}
      cx={point.x}
      cy={point.y}
      r={4}
      fill="red"
    />
  );
}
