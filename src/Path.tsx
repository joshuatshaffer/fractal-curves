import { useAtomValue } from "jotai";
import { Vector2 } from "./Vector2";
import { viewSettingsAtom } from "./atoms/atoms";
import { pointToSvg } from "./viewSpace";

export function Path({
  points,
  fillMode,
  color = "black",
}: {
  points: Vector2[];
  fillMode: boolean;
  color?: string;
}) {
  const viewSettings = useAtomValue(viewSettingsAtom);

  const points0 = points.map((p) => pointToSvg(viewSettings, p));

  return (
    <path
      d={`M ${points0.map((p) => `${p.x} ${p.y}`).join(" L ")} ${
        fillMode ? "Z" : ""
      }`}
      fill={fillMode ? color : "none"}
      stroke={fillMode ? "none" : color}
    />
  );
}
