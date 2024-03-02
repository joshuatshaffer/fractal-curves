import { eventXY } from "./eventXY";
import { FractalCurveGenerator } from "./fractal";
import { onDrag } from "./onDrag";
import { ViewSettings, pointToSvg } from "./viewSpace";

export function ControlPoint({
  index,
  generator,
  setGenerator,
  viewSettings,
  setViewSettings,
}: {
  index: number;
  generator: FractalCurveGenerator;
  setGenerator: (generator: FractalCurveGenerator) => void;
  viewSettings: ViewSettings;
  setViewSettings: (viewSettings: ViewSettings) => void;
}) {
  const point = pointToSvg(viewSettings, generator[index] ?? { x: 0, y: 0 });

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

            if (index === -1) {
              setViewSettings({
                ...viewSettings,
                translate: {
                  x: viewSettings.translate.x + dx * viewSettings.scale,
                  y: viewSettings.translate.y + dy * viewSettings.scale,
                },
              });
              setGenerator(
                generator.map((p) => ({ ...p, x: p.x - dx, y: p.y - dy }))
              );
            } else {
              setGenerator(
                generator.map((p, i) =>
                  i === index ? { ...p, x: p.x + dx, y: p.y + dy } : p
                )
              );
            }
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
