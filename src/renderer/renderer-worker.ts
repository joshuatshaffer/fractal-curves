import { RenderWorkerMessageData } from "./RenderWorkerMessageData";
import { PaintArgs, paint } from "./paint";

let canvas: OffscreenCanvas | undefined = undefined;
let ctx: OffscreenCanvasRenderingContext2D | null = null;

let paintArgs: PaintArgs | undefined = undefined;

let animationFrame: number | undefined = undefined;

addEventListener("message", (event: MessageEvent<RenderWorkerMessageData>) => {
  const args = event.data;

  if (args.type === "setCanvas") {
    if (args.canvas !== canvas) {
      canvas = args.canvas;
      // It is important to only call getContext once. If we call it every paint
      // there will be flickering in Firefox.
      ctx = canvas.getContext("2d");
    }
  } else if (args.type === "paint") {
    paintArgs = args;
  }

  // Store the animationFrame in a variable so that we only request one at a time.
  animationFrame ??= requestAnimationFrame(() => {
    animationFrame = undefined;
    if (canvas && ctx && paintArgs) {
      paint(canvas, ctx, paintArgs);
    }
  });
});
