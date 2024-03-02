import { useAtomValue } from "jotai";
import { Point } from "./Point";
import { viewSettingsAtom } from "./atoms/atoms";
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
      strokeWidth={2}
      stroke={color}
      fill={color}
      markerEnd={arrowMarkerRef}
    />
  );
}

const arrowMarkerId = "svg-marker-arrow";

const arrowMarkerRef = `url(#${arrowMarkerId})`;

const arrowLength = 10;
const arrowWidth = 5;
const arrowIndent = 2.5;

export function ArrowMarker() {
  return (
    <marker
      id={arrowMarkerId}
      viewBox={`0 0 ${arrowLength} ${arrowWidth}`}
      refX={arrowLength}
      refY={arrowWidth}
      markerWidth={arrowLength}
      markerHeight={arrowWidth}
      orient="auto-start-reverse"
    >
      <path
        d={`M 0 0 L ${arrowLength} ${arrowWidth} L ${arrowIndent} ${arrowWidth} z`}
        fill="context-fill"
      />
    </marker>
  );
}
