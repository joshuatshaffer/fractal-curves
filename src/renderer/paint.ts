import {
  FractalCurveGenerator,
  generateFractalCurve,
  getBaseLine,
} from "../fractal";
import { ViewSettings, pointToSvg } from "../viewSpace";

export interface PaintArgs {
  width: number;
  height: number;
  iterations: number;
  viewSettings: ViewSettings;
  generator: FractalCurveGenerator;
  renderMode: "line" | "fill" | "gradient";
}

export function paint(
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

  if (args.renderMode === "gradient") {
    for (let i = 1; i < points.length; i++) {
      ctx.strokeStyle = `hsl(${(i / points.length) * 300}, 100%, 50%)`;

      const from = points[i - 1];
      const to = points[i];

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
  } else if (args.renderMode === "fill") {
    const baseLine = getBaseLine(args.generator);
    const baseDelta = pointToSvg(args.viewSettings, baseLine.to).subtract(
      pointToSvg(args.viewSettings, baseLine.from)
    );

    const extensionBoxTopLeft = points[0].subtract(baseDelta.scale(10));
    const extensionBoxBottomLeft = extensionBoxTopLeft.add(
      baseDelta.scale(10).rotate(Math.PI / 2)
    );

    const extensionBoxTopRight = points[points.length - 1].add(
      baseDelta.scale(10)
    );
    const extensionBoxBottomRight = extensionBoxTopRight.add(
      baseDelta.scale(10).rotate(Math.PI / 2)
    );

    ctx.fillStyle = `gray`;
    ctx.beginPath();
    ctx.moveTo(extensionBoxBottomLeft.x, extensionBoxBottomLeft.y);
    ctx.lineTo(extensionBoxTopLeft.x, extensionBoxTopLeft.y);
    ctx.lineTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(extensionBoxTopRight.x, extensionBoxTopRight.y);
    ctx.lineTo(extensionBoxBottomRight.x, extensionBoxBottomRight.y);
    ctx.fill("evenodd");
  } else {
    ctx.strokeStyle = `#00000088`;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }
}
