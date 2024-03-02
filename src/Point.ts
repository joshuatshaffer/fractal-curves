export interface PointLike {
  readonly x: number;
  readonly y: number;
}

export class Point implements PointLike {
  constructor(public readonly x: number, public readonly y: number) {}

  static from(p: PointLike): Point {
    if (p instanceof Point) {
      return p;
    }
    return new Point(p.x, p.y);
  }

  toJSON(): PointLike {
    return { x: this.x, y: this.y };
  }

  add(p: PointLike): Point {
    return new Point(this.x + p.x, this.y + p.y);
  }

  subtract(p: PointLike): Point {
    return new Point(this.x - p.x, this.y - p.y);
  }

  negate(): Point {
    return new Point(-this.x, -this.y);
  }

  scale(s: number): Point {
    return new Point(this.x * s, this.y * s);
  }

  rotate(angle: number): Point {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Point(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  mag(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  static readonly zero = new Point(0, 0);
  static readonly right = new Point(1, 0);
  static readonly down = new Point(0, 1);

  /**
   * Linearly interpolate.
   */
  static lerp(from: Point, to: Point, t: number): Point {
    return from.scale(1 - t).add(to.scale(t));
  }
}
