import { Vector2, Vector2Like } from "./Vector2";
import { pipeline } from "./pipeline";

export interface GeneratorSegment extends Vector2Like {
  reversed: boolean;
}

export type FractalCurveGenerator = GeneratorSegment[];

export function getBaseLine(generator: FractalCurveGenerator) {
  return {
    from: Vector2.zero,
    to: Vector2.from(generator[generator.length - 1]),
  };
}

export function getLines(generator: FractalCurveGenerator) {
  return generator
    .map((x) => ({ reversed: x.reversed, p: Vector2.from(x) }))
    .map(({ reversed, p: to }, i, a) => {
      const from = a[i - 1]?.p ?? Vector2.zero;
      return reversed
        ? { reversed: true, from: to, to: from }
        : { reversed: false, from, to };
    });
}

export function generateFractalCurve(
  generator: FractalCurveGenerator,
  iterations: number
): Vector2[] {
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
      Vector2.zero,
      ...generator.map((p, i) => {
        return Vector2.lerp(
          baseDelta.scale((i + 1) / generator.length),
          Vector2.from(p),
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
