import { pipeline } from "./pipeline";

export interface Point {
  x: number;
  y: number;
}

/**
 * A line segment from one point to another.
 */
export interface Line {
  from: Point;
  to: Point;
}

export interface GeneratorSegment extends Point {
  reversed: boolean;
}

export type FractalCurveGenerator = GeneratorSegment[];

export function getBaseLine(generator: FractalCurveGenerator): Line {
  return {
    from: { x: 0, y: 0 },
    to: generator[generator.length - 1],
  };
}

export function getLines(generator: FractalCurveGenerator): Line[] {
  return generator.map((to, i) => {
    const from = generator[i - 1] ?? { x: 0, y: 0 };
    return to.reversed ? { from: to, to: from } : { from, to };
  });
}

function getRotationAndScale(
  from: Point,
  to: Point
): { angle: number; mag: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);
  const mag = Math.sqrt(dx * dx + dy * dy);
  return { angle, mag };
}

export function scale({ x, y }: Point, factor: number): Point {
  return { x: x * factor, y: y * factor };
}

export function rotate({ x, y }: Point, angle: number): Point {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: x * c - y * s, y: x * s + y * c };
}

export function translate(p: Point, d: Point): Point {
  return { x: p.x + d.x, y: p.y + d.y };
}

export function generateFractalCurve(
  generator: FractalCurveGenerator,
  level: number
): Point[] {
  if (level < 0 || !Number.isInteger(level)) {
    throw new Error("Level must be a non-negative integer");
  }

  if (level === 0) {
    const l = getBaseLine(generator);
    return [l.from, l.to];
  }

  if (level === 1) {
    return [{ x: 0, y: 0 }, ...generator];
  }

  const points = generateFractalCurve(generator, level - 1);

  const l = getBaseLine(generator);

  const base = getRotationAndScale(l.from, l.to);

  return generator
    .map((to, i) => {
      const from = generator[i - 1] ?? { x: 0, y: 0 };
      return to.reversed
        ? { reversed: true, from: to, to: from }
        : { reversed: false, from, to };
    })
    .flatMap(({ from, to, reversed }, i) => {
      const { angle: angle, mag: mag } = getRotationAndScale(from, to);

      const scaleFactor = mag / base.mag;
      const rotation = angle - base.angle;

      return pipeline(
        points.map((p) =>
          pipeline(p)
            .then((p) => scale(p, scaleFactor))
            .then((p) => rotate(p, rotation))
            .then((p) => translate(p, from))
            .done()
        )
      )
        .then((movedPoints) => (reversed ? movedPoints.reverse() : movedPoints))
        .then((movedPoints) => (i === 0 ? movedPoints : movedPoints.slice(1)))
        .done();
    });
}
