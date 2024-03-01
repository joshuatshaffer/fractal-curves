import { Point } from "./fractal";
import { usePointToSvg } from "./viewSpace";

export function Path({
  points,
  fillMode,
  color = "black",
}: {
  points: Point[];
  fillMode: boolean;
  color?: string;
}) {
  const pointToSvg = usePointToSvg();

  const points0 = points.map((p) => pointToSvg(p));

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
