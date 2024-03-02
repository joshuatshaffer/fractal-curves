import { FractalCurveGenerator } from "./fractal";

interface ExampleFractalCurve {
  name: string;
  generator: FractalCurveGenerator;
}

export const dragon: ExampleFractalCurve = {
  name: "Dragon",
  generator: [
    {
      reversed: true,
      x: 10,
      y: 0,
    },
    {
      reversed: false,
      x: 10,
      y: 10,
    },
  ],
};

function triLattice(x: number, y: number) {
  return {
    x: (x + y / 2) * 10,
    y: -y * (Math.sqrt(3) / 2) * 10,
  };
}

export const snowflakeSweep = {
  name: "Snowflake Sweep",
  generator: [
    {
      ...triLattice(0, 1),
      reversed: true,
    },
    {
      ...triLattice(0, 2),
      reversed: false,
    },
    {
      ...triLattice(1, 2),
      reversed: false,
    },
    {
      ...triLattice(2, 1),
      reversed: false,
    },
    {
      ...triLattice(1, 0),
      reversed: true,
    },
    {
      ...triLattice(2, 0),
      reversed: true,
    },
    {
      ...triLattice(3, 0),
      reversed: false,
    },
  ],
};

export const gosperCurve = {
  name: "Gosper Curve",
  generator: [
    {
      ...triLattice(1, 0),
      reversed: false,
    },
    {
      ...triLattice(1, 1),
      reversed: true,
    },
    {
      ...triLattice(0, 1),
      reversed: true,
    },
    {
      ...triLattice(-1, 2),
      reversed: false,
    },
    {
      ...triLattice(0, 2),
      reversed: false,
    },
    {
      ...triLattice(1, 2),
      reversed: false,
    },
    {
      ...triLattice(2, 1),
      reversed: true,
    },
  ],
};

export const sierpinskiArrowhead = {
  name: "Sierpiński Arrowhead",
  generator: [
    {
      ...triLattice(1, 0),
      reversed: false,
    },
    {
      ...triLattice(1, 1),
      reversed: true,
    },
    {
      ...triLattice(0, 2),
      reversed: false,
    },
    {
      ...triLattice(0, 3),
      reversed: true,
    },
    {
      ...triLattice(1, 3),
      reversed: false,
    },
    {
      ...triLattice(2, 2),
      reversed: true,
    },
    {
      ...triLattice(2, 1),
      reversed: false,
    },
    {
      ...triLattice(3, 0),
      reversed: true,
    },
    {
      ...triLattice(4, 0),
      reversed: false,
    },
  ],
};
