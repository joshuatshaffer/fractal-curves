import { Point } from "./Point";

export interface ViewSettings {
  scale: number;
  translate: Point;
}

export function pointToSvg(v: ViewSettings, p: Point) {
  return p.scale(v.scale).add(v.translate);
}

export function fromClient(v: ViewSettings, p: Point) {
  return p.subtract(v.translate).scale(1 / v.scale);
}
