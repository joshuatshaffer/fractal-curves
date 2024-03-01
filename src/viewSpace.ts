import { createContext, useContext } from "react";
import { Point, scale, translate } from "./fractal";

interface ViewSettings {
  scale: number;
  translate: Point;
}

function pointToSvg(v: ViewSettings, p: Point): Point {
  return translate(scale(p, v.scale), v.translate);
}

const ViewSettingsContext = createContext<ViewSettings>({
  scale: 1,
  translate: { x: 0, y: 0 },
});

export const ViewSettingsContextProvider = ViewSettingsContext.Provider;

export function usePointToSvg() {
  const v = useContext(ViewSettingsContext);
  return (p: Point) => pointToSvg(v, p);
}
