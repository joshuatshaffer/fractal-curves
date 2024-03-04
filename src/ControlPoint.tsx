import { useAtom } from "jotai";
import style from "./ControlPoint.module.scss";
import { Vector2 } from "./Vector2";
import { generatorAtom, viewSettingsAtom } from "./atoms/atoms";
import { eventXY } from "./eventXY";
import { onDrag } from "./onDrag";
import { pointToSvg } from "./viewSpace";

export function ControlPoint({ index }: { index: number }) {
  const [generator, setGenerator] = useAtom(generatorAtom);
  const [viewSettings, setViewSettings] = useAtom(viewSettingsAtom);

  const point = pointToSvg(
    viewSettings,
    Vector2.from(generator[index] ?? Vector2.zero)
  );

  return (
    <circle
      className={style.controlPoint}
      {...onDrag((e) => {
        const start = eventXY(e);
        return {
          onDragMove: (e) => {
            const current = eventXY(e);
            const d = current.subtract(start).scale(1 / viewSettings.scale);

            if (index === -1) {
              setViewSettings({
                ...viewSettings,
                translate: viewSettings.translate.add(
                  d.scale(viewSettings.scale)
                ),
              });
              setGenerator(
                generator.map((p) => ({ ...p, x: p.x - d.x, y: p.y - d.y }))
              );
            } else {
              setGenerator(
                generator.map((p, i) =>
                  i === index ? { ...p, x: p.x + d.x, y: p.y + d.y } : p
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
