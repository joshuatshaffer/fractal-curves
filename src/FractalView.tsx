import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import styles from "./App.module.scss";
import { Arrow, ArrowMarker } from "./Arrow";
import { ControlPoint } from "./ControlPoint";
import { Path } from "./Path";
import {
  fillModeAtom,
  generatorAtom,
  normalizeViewAtom,
  pointsAtom,
  svgElementAtom,
  viewSettingsAtom,
} from "./atoms/atoms";
import { eventXY } from "./eventXY";
import { getBaseLine, getLines } from "./fractal";
import { onDrag } from "./onDrag";

export function FractalView() {
  const generator = useAtomValue(generatorAtom);

  const fillMode = useAtomValue(fillModeAtom);

  const points = useAtomValue(pointsAtom);

  const [viewSettings, setViewSettings] = useAtom(viewSettingsAtom);

  const [svgElement, setSvgElement] = useAtom(svgElementAtom);

  useEffect(() => {
    if (!svgElement) {
      return;
    }

    const listener = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      // TODO: Stay centered on the mouse position.
      setViewSettings((prev) => ({
        ...prev,
        scale: prev.scale * 2 ** (event.deltaY * 0.01),
      }));
    };

    svgElement.addEventListener("wheel", listener);
    return () => {
      svgElement.removeEventListener("wheel", listener);
    };
  }, [setViewSettings, svgElement]);

  const normalizeView = useSetAtom(normalizeViewAtom);

  // Normalize view on page load.
  useEffect(() => {
    normalizeView();
  }, [normalizeView]);

  return (
    <svg
      ref={setSvgElement}
      className={styles.view}
      {...onDrag((event) => {
        const start = eventXY(event);
        return {
          onDragMove: (event) => {
            const current = eventXY(event);
            const dx = current.x - start.x;
            const dy = current.y - start.y;
            setViewSettings({
              ...viewSettings,
              translate: {
                x: viewSettings.translate.x + dx,
                y: viewSettings.translate.y + dy,
              },
            });
          },
        };
      })}
    >
      <defs>
        <ArrowMarker />
      </defs>
      <Path points={points} fillMode={fillMode} />

      <g className={styles.controls}>
        <Arrow {...getBaseLine(generator)} color="#ff0000" />
        {getLines(generator).map(({ from, to }, i) => (
          <Arrow key={i} from={from} to={to} color="#0000ff" />
        ))}
        <ControlPoint index={-1} />
        {generator.map((_, i) => (
          <ControlPoint key={i} index={i} />
        ))}
      </g>
    </svg>
  );
}
