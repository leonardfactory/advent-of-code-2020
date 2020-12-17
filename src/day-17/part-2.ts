import fs from 'fs';
import { cloneDeep } from 'lodash';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input.test.txt', 'utf-8');

enum Cube {
  On = '#',
  Off = '.'
}

const F_SIZE = 100;
const F_SIZE_HALF = F_SIZE / 2;

type Coord = { x: number; y: number; z: number; w: number };
const xmap = (n: number) => n + F_SIZE_HALF;
const vmap = ({ x, y, z, w }: Coord): Coord => ({
  x: x + F_SIZE_HALF,
  y: y + F_SIZE_HALF,
  z: z + F_SIZE_HALF,
  w: w + F_SIZE_HALF
});

const xexist = (n: number) => n >= 0 && n < F_SIZE;
const vexist = ({ x, y, z, w }: Coord) =>
  xexist(x) && xexist(y) && xexist(z) && xexist(w);

class Space {
  map: Cube[][][][] = Array(F_SIZE)
    .fill(0)
    .map((_) =>
      Array(F_SIZE)
        .fill(0)
        .map((_) =>
          Array(F_SIZE)
            .fill(0)
            .map((_) => Array(F_SIZE).fill(Cube.Off))
        )
    );

  // Dimensioni massime attuali
  bounds = {
    x: { min: F_SIZE_HALF, max: F_SIZE_HALF },
    y: { min: F_SIZE_HALF, max: F_SIZE_HALF },
    z: { min: F_SIZE_HALF, max: F_SIZE_HALF },
    w: { min: F_SIZE_HALF, max: F_SIZE_HALF }
  };

  active = 0;

  constructor(source: string) {
    // Init from layer0
    const layer0 = source.split('\n').map((r) => r.split('') as Cube[]);
    for (let y = 0; y < layer0.length; y++) {
      for (let x = 0; x < layer0[0].length; x++) {
        this.vmapSet({ x, y, z: 0, w: 0 }, layer0[y][x]);
      }
    }
    this.printLayer(0);
  }

  printLayer(z: number) {
    const vz = xmap(z);
    const vw = xmap(0);
    console.log(`\n=== Layer (z=${z}, w=0) ===`);
    const { bounds } = this;
    for (let y = bounds.y.min - 1; y < bounds.y.max + 1; y++) {
      let chunk = '';
      for (let x = bounds.x.min - 1; x < bounds.x.max + 1; x++) {
        chunk += this.map[vw][vz][y][x];
      }
      console.log(chunk);
    }
    console.log('\n');
  }

  vmapSet(coord: Coord, value: Cube) {
    const vcoord = vmap(coord);
    this.set(vcoord, value);
  }

  set({ x, y, z, w }: Coord, value: Cube) {
    const prev = this.map[w][z][y][x];
    this.map[w][z][y][x] = value;

    if (prev !== value) {
      this.active = value === Cube.On ? this.active + 1 : this.active - 1;
    }

    if (value === Cube.On) {
      const bounds = this.bounds;
      if (x > bounds.x.max) bounds.x.max = x;
      else if (x < bounds.x.min) bounds.x.min = x;

      if (y > bounds.y.max) bounds.y.max = y;
      else if (y < bounds.y.min) bounds.y.min = y;

      if (z > bounds.z.max) bounds.z.max = z;
      else if (z < bounds.z.min) bounds.z.min = z;

      if (w > bounds.w.max) bounds.w.max = w;
      else if (w < bounds.w.min) bounds.w.min = w;
    }
  }

  around(coord: Coord) {
    let nears = [] as Coord[];
    for (let w = coord.w - 1; w <= coord.w + 1; w++) {
      for (let z = coord.z - 1; z <= coord.z + 1; z++) {
        for (let y = coord.y - 1; y <= coord.y + 1; y++) {
          for (let x = coord.x - 1; x <= coord.x + 1; x++) {
            if (x == coord.x && y == coord.y && z == coord.z && w == coord.w)
              continue;
            const near = { x, y, z, w };
            if (vexist(near)) nears.push(near);
          }
        }
      }
    }
    // console.log(`nears`, coord, nears);
    return nears;
  }

  cycle() {
    const bounds = this.bounds;
    let updates: [Coord, Cube][] = [];

    // Calcolo
    for (let w = bounds.w.min - 1; w <= bounds.w.max + 1; w++) {
      for (let z = bounds.z.min - 1; z <= bounds.z.max + 1; z++) {
        // console.log(`Plane Z: ${z} (${z - F_SIZE_HALF})`, bounds);
        for (let y = bounds.y.min - 1; y <= bounds.y.max + 1; y++) {
          for (let x = bounds.x.min - 1; x <= bounds.x.max + 1; x++) {
            const c = { x, y, z, w };
            const prev = this.map[c.w][c.z][c.y][c.x];

            const arounds = this.around(c);
            let on = 0;
            for (const a of arounds) {
              if (this.map[a.w][a.z][a.y][a.x] === Cube.On) on++;
            }

            // Logic
            if (prev === Cube.On) {
              updates.push([c, on === 2 || on === 3 ? Cube.On : Cube.Off]);
            } else {
              updates.push([c, on === 3 ? Cube.On : Cube.Off]);
            }
          }
        }
      }
    }

    // Applico
    for (let [c, value] of updates) {
      this.set(c, value);
    }
  }
}

function count(data: string) {
  const space = new Space(data);
  for (let i = 0; i < 6; i++) {
    space.cycle();

    console.log(`------ ITERATION ${i + 1} ------`);
    space.printLayer(-1);
    space.printLayer(0);
    space.printLayer(1);
  }
  return space.active;
}

console.log(`Active after 6: ${count(input)}`);
