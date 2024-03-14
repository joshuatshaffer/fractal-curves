import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomEffect } from "jotai-effect";
import { RefCallback, useEffect, useState } from "react";
import { Arrow, ArrowMarker } from "./Arrow";
import { ControlPoint } from "./ControlPoint";
import styles from "./FractalView.module.scss";
import {
  generatorAtom,
  iterationsAtom,
  normalizeViewAtom,
  renderModeAtom,
  showControlOverlayAtom,
  viewSettingsAtom,
} from "./atoms/atoms";
import { eventXY } from "./eventXY";
import { getBaseLine, getLines } from "./fractal";
import { onDrag } from "./onDrag";
import { fromClient, pointToSvg } from "./viewSpace";

export function FractalView() {
  const normalizeView = useSetAtom(normalizeViewAtom);

  // Normalize view on page load.
  useEffect(() => {
    normalizeView();
  }, [normalizeView]);

  const [viewRootElement, setViewRootElement] = useState<HTMLDivElement | null>(
    null
  );
  const [viewSettings, setViewSettings] = useAtom(viewSettingsAtom);

  useEffect(() => {
    if (!viewRootElement) {
      return;
    }

    const listener = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      setViewSettings((prev) => {
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
    };

    viewRootElement.addEventListener("wheel", listener);
    return () => {
      viewRootElement.removeEventListener("wheel", listener);
    };
  }, [setViewSettings, viewRootElement]);

  const showControlOverlay = useAtomValue(showControlOverlayAtom);

  return (
    <div
      ref={setViewRootElement}
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
      <Canvas />
      {showControlOverlay ? <UiOverlay /> : null}
    </div>
  );
}

function UiOverlay() {
  const generator = useAtomValue(generatorAtom);

  return (
    <svg className={styles.view}>
      <defs>
        <ArrowMarker />
      </defs>

      <Arrow {...getBaseLine(generator)} color="#ff0000" />
      {getLines(generator).map(({ from, to }, i) => (
        <Arrow key={i} from={from} to={to} color="#0000ff" />
      ))}
      <ControlPoint index={-1} />
      {generator.map((_, i) => (
        <ControlPoint key={i} index={i} />
      ))}
    </svg>
  );
}

function initRendererWorker() {
  const worker = new Worker(
    new URL("./renderer/renderer-worker.ts", import.meta.url),
    { type: "module" }
  );

  const canvasRef: RefCallback<HTMLCanvasElement> = (canvasElement) => {
    if (!canvasElement) {
      return;
    }

    const offscreen = canvasElement.transferControlToOffscreen();

    worker.postMessage({ type: "setCanvas", canvas: offscreen }, [offscreen]);
  };

  const paintArgsEffectAtom = atomEffect((get) => {
    worker.postMessage({
      type: "paint",
      width: window.innerWidth,
      height: window.innerHeight,
      viewSettings: get(viewSettingsAtom),
      iterations: get(iterationsAtom),
      generator: get(generatorAtom),
      renderMode: get(renderModeAtom),
    });
  });

  return { canvasRef, paintArgsEffectAtom };
}

function Canvas() {
  const [{ canvasRef, paintArgsEffectAtom }] = useState(initRendererWorker);

  useAtomValue(paintArgsEffectAtom);

  return <canvas ref={canvasRef} className={styles.view} />;
}
