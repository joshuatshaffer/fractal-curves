import { Point, scale, translate } from "./fractal";

export interface ViewSettings {
  scale: number;
  translate: Point;
}

export function pointToSvg(v: ViewSettings, p: Point): Point {
  return translate(scale(p, v.scale), v.translate);
}
