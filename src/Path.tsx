import { Point } from "./fractal";
import { usePointToSvg } from "./viewSpace";

export function Path({ points }: { points: Point[] }) {
  const pointToSvg = usePointToSvg();

  const points0 = points.map((p) => pointToSvg(p));

  return (
    <path
      d={`M ${points0.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
      fill="none"
      stroke="green"
    />
  );
}
