import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback, useEffect, useState } from "react";
import styles from "./App.module.scss";
import { Arrow, ArrowMarker } from "./Arrow";
import { ControlPoint } from "./ControlPoint";
import {
  fillModeAtom,
  generatorAtom,
  iterationsAtom,
  normalizeViewAtom,
  viewSettingsAtom,
} from "./atoms/atoms";
import { eventXY } from "./eventXY";
import { getBaseLine, getLines } from "./fractal";
import { onDrag } from "./onDrag";
import { fromClient, pointToSvg } from "./viewSpace";

export function FractalView() {
  const generator = useAtomValue(generatorAtom);

  const [viewSettings, setViewSettings] = useAtom(viewSettingsAtom);

  const [svgElement, setSvgElement] = useState<SVGSVGElement | null>(null);

  const zoom = useAtomCallback(
    useCallback((_get, set, event: WheelEvent) => {
      set(viewSettingsAtom, (prev) => {
        const newScale = prev.scale * 2 ** (-event.deltaY * 0.01);
        const mousePosition0 = eventXY(event);
        const mousePosition1 = pointToSvg(
          { ...prev, scale: newScale },
          fromClient(prev, mousePosition0)
        );

        return {
          ...prev,
          scale: newScale,
          translate: prev.translate
            .add(mousePosition0)
            .subtract(mousePosition1),
        };
      });
    }, [])
  );

  useEffect(() => {
    if (!svgElement) {
      return;
    }

    const listener = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      zoom(event);
    };

    svgElement.addEventListener("wheel", listener);
    return () => {
      svgElement.removeEventListener("wheel", listener);
    };
  }, [svgElement, zoom]);

  const normalizeView = useSetAtom(normalizeViewAtom);

  // Normalize view on page load.
  useEffect(() => {
    normalizeView();
  }, [normalizeView]);

  return (
    <>
      <Canvas />
      <svg
        ref={setSvgElement}
        className={styles.view}
        {...onDrag((event) => {
          const start = eventXY(event);
          return {
            onDragMove: (event) => {
              const current = eventXY(event);
              const d = current.subtract(start);
              setViewSettings({
                ...viewSettings,
                translate: viewSettings.translate.add(d),
              });
            },
          };
        })}
      >
        <defs>
          <ArrowMarker />
        </defs>

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
    </>
  );
}

function Canvas() {
  const [worker] = useState(
    () =>
      new Worker(new URL("./renderer/renderer-worker.ts", import.meta.url), {
        type: "module",
      })
  );

  const generator = useAtomValue(generatorAtom);

  const fillMode = useAtomValue(fillModeAtom);

  const viewSettings = useAtomValue(viewSettingsAtom);

  const iterations = useAtomValue(iterationsAtom);

  useEffect(() => {
    worker.postMessage({
      type: "paint",
      width: window.innerWidth,
      height: window.innerHeight,
      viewSettings,
      iterations,
      generator,
      fillMode,
      gradient: false,
    });
  }, [fillMode, generator, iterations, viewSettings, worker]);

  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(
    null
  );

  useEffect(() => {
    if (!canvasElement) {
      return;
    }

    const offscreen = canvasElement.transferControlToOffscreen();

    worker.postMessage(
      {
        type: "setCanvas",
        canvas: offscreen,
      },
      [offscreen]
    );
  }, [canvasElement, worker]);

  return <canvas ref={setCanvasElement} className={styles.view} />;
}
