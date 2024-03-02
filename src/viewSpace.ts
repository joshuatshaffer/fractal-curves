import { Point, scale, translate } from "./fractal";

export interface ViewSettings {
  scale: number;
  translate: Point;
}

export function pointToSvg(v: ViewSettings, p: Point): Point {
  return translate(scale(p, v.scale), v.translate);
}

export function fromClient(v: ViewSettings, p: Point): Point {
  return scale(
    translate(p, {
      x: -v.translate.x,
      y: -v.translate.y,
    }),
    1 / v.scale
  );
}
