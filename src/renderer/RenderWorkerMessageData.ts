import type { PaintArgs } from "./paint";

interface SetPaintArgs extends PaintArgs {
  type: "paint";
}

interface SetCanvasArgs {
  type: "setCanvas";

  canvas: OffscreenCanvas;
}

export type RenderWorkerMessageData = SetPaintArgs | SetCanvasArgs;
