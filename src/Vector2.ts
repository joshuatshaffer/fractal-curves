export interface Vector2Like {
  readonly x: number;
  readonly y: number;
}

export class Vector2 implements Vector2Like {
  constructor(public readonly x: number, public readonly y: number) {}

  static from(p: Vector2Like): Vector2 {
    if (p instanceof Vector2) {
      return p;
    }
    return new Vector2(p.x, p.y);
  }

  toJSON(): Vector2Like {
    return { x: this.x, y: this.y };
  }

  add(p: Vector2Like): Vector2 {
    return new Vector2(this.x + p.x, this.y + p.y);
  }

  subtract(p: Vector2Like): Vector2 {
    return new Vector2(this.x - p.x, this.y - p.y);
  }

  negate(): Vector2 {
    return new Vector2(-this.x, -this.y);
  }

  scale(s: number): Vector2 {
    return new Vector2(this.x * s, this.y * s);
  }

  rotate(angle: number): Vector2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector2(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  mag(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  static readonly zero = new Vector2(0, 0);
  static readonly right = new Vector2(1, 0);
  static readonly down = new Vector2(0, 1);

  /**
   * Linearly interpolate.
   */
  static lerp(from: Vector2, to: Vector2, t: number): Vector2 {
    return from.scale(1 - t).add(to.scale(t));
  }
}
