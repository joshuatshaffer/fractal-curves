import { useAtomValue } from "jotai";
import { viewSettingsAtom } from "./atoms/atoms";
import { Point } from "./fractal";
import { pointToSvg } from "./viewSpace";

export function Arrow({
  from,
  to,
  color = "black",
}: {
  from: Point;
  to: Point;
  color?: string;
}) {
  const viewSettings = useAtomValue(viewSettingsAtom);

  const from0 = pointToSvg(viewSettings, from);
  const to0 = pointToSvg(viewSettings, to);

  return (
    <line
      x1={from0.x}
      y1={from0.y}
      x2={to0.x}
      y2={to0.y}
      stroke={color}
      fill={color}
      markerEnd={arrowMarkerRef}
    />
  );
}

const arrowMarkerId = "svg-marker-arrow";

const arrowMarkerRef = `url(#${arrowMarkerId})`;

export function ArrowMarker() {
  return (
    <marker
      id={arrowMarkerId}
      viewBox="0 0 10 10"
      refX="5"
      refY="5"
      markerWidth="6"
      markerHeight="6"
      orient="auto-start-reverse"
    >
      <path d="M 0 0 L 10 5 L 0 10 z" fill="context-fill" />
    </marker>
  );
}
