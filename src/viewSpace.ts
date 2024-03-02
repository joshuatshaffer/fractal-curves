import { useAtomValue } from "jotai";
import { viewSettingsAtom } from "./atoms";
import { Point, scale, translate } from "./fractal";

export interface ViewSettings {
  scale: number;
  translate: Point;
}

export function pointToSvg(v: ViewSettings, p: Point): Point {
  return translate(scale(p, v.scale), v.translate);
}

export function usePointToSvg() {
  const v = useViewSettings();
  return (p: Point) => pointToSvg(v, p);
}

export function useViewSettings() {
  return useAtomValue(viewSettingsAtom);
}
