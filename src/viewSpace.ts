import { Vector2 } from "./Vector2";

export interface ViewSettings {
  scale: number;
  translate: Vector2;
}

export function pointToSvg(v: ViewSettings, p: Vector2) {
  return p.scale(v.scale).add(v.translate);
}

export function fromClient(v: ViewSettings, p: Vector2) {
  return p.subtract(v.translate).scale(1 / v.scale);
}
