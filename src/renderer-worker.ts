import { FractalCurveGenerator, generateFractalCurve } from "./fractal";
import { ViewSettings, pointToSvg } from "./viewSpace";

function paint(
  canvas: OffscreenCanvas,
  ctx: OffscreenCanvasRenderingContext2D,
  args: PaintArgs
) {
  canvas.width = args.width;
  canvas.height = args.height;

  const points = generateFractalCurve(args.generator, args.iterations).map(
    (p) => pointToSvg(args.viewSettings, p)
  );

  ctx.clearRect(0, 0, args.width, args.height);

  if (args.gradient) {
    for (let i = 1; i < points.length; i++) {
      ctx.strokeStyle = `hsl(${(i / points.length) * 360}, 100%, 50%)`;

      const from = points[i - 1];
      const to = points[i];

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
  } else {
    ctx.strokeStyle = `#00000088`;
    ctx.fillStyle = `gray`;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    if (args.fillMode) {
      ctx.fill();
    } else {
      ctx.stroke();
    }
  }
}

let canvas: OffscreenCanvas | undefined = undefined;
let ctx: OffscreenCanvasRenderingContext2D | null = null;

let paintArgs: PaintArgs | undefined = undefined;

let animationFrame: number | undefined = undefined;

addEventListener("message", (e) => {
  console.log("worker got message", e.data);

  const args = e.data as PaintArgs | SetCanvasArgs;

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

  animationFrame ??= requestAnimationFrame(() => {
    animationFrame = undefined;
    if (canvas && ctx && paintArgs) {
      paint(canvas, ctx, paintArgs);
    }
  });
});

interface PaintArgs {
  type: "paint";
  width: number;
  height: number;
  iterations: number;
  viewSettings: ViewSettings;
  generator: FractalCurveGenerator;
  fillMode: boolean;
  gradient: boolean;
}

interface SetCanvasArgs {
  type: "setCanvas";

  canvas: OffscreenCanvas;
}
