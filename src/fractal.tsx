import { Point, PointLike } from "./Point";
import { pipeline } from "./pipeline";

export interface GeneratorSegment extends PointLike {
  reversed: boolean;
}

export type FractalCurveGenerator = GeneratorSegment[];

export function getBaseLine(generator: FractalCurveGenerator) {
  return {
    from: Point.zero,
    to: Point.from(generator[generator.length - 1]),
  };
}

export function getLines(generator: FractalCurveGenerator) {
  return generator
    .map((x) => ({ reversed: x.reversed, p: Point.from(x) }))
    .map(({ reversed, p: to }, i, a) => {
      const from = a[i - 1]?.p ?? Point.zero;
      return reversed
        ? { reversed: true, from: to, to: from }
        : { reversed: false, from, to };
    });
}

export function generateFractalCurve(
  generator: FractalCurveGenerator,
  iterations: number
): Point[] {
  if (iterations < 0 || !Number.isFinite(iterations)) {
    console.error("Iterations must be a non-negative number");
    // Be fault tolerant and use 0 iterations.
    return generateFractalCurve(generator, 0);
  }

  const l = getBaseLine(generator);

  if (iterations === 0) {
    return [l.from, l.to];
  }

  const baseDelta = l.to.subtract(l.from);

  if (iterations <= 1) {
    return [
      Point.zero,
      ...generator.map((p, i) => {
        return Point.lerp(
          baseDelta.scale((i + 1) / generator.length),
          Point.from(p),
          iterations
        );
      }),
    ];
  }

  const points = generateFractalCurve(generator, iterations - 1);

  return getLines(generator).flatMap(({ from, to, reversed }, i) => {
    const delta = to.subtract(from);

    const scaleFactor = delta.mag() / baseDelta.mag();
    const rotation = delta.angle() - baseDelta.angle();

    return pipeline(
      points.map((p) => p.scale(scaleFactor).rotate(rotation).add(from))
    )
      .then((movedPoints) => (reversed ? movedPoints.reverse() : movedPoints))
      .then((movedPoints) => (i === 0 ? movedPoints : movedPoints.slice(1)))
      .done();
  });
}

export function maxIterationsFromMaxPoints(
  maxPoints: number,
  generator: FractalCurveGenerator
) {
  return Math.floor(Math.log(maxPoints) / Math.log(generator.length));
}
