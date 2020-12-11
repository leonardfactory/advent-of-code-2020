export enum Tile {
  Floor = '.',
  Empty = 'L',
  Occupied = '#'
}

export type Loc = {
  x: number;
  y: number;
};

export function Loc(x: number, y: number): Loc {
  return { x, y };
}

const AroundTiles = [
  [-1, -1],
  [+0, -1],
  [+1, -1],
  [-1, +0],
  [+1, +0],
  [-1, +1],
  [+0, +1],
  [+1, +1]
];

/**
 * Rappresenta una mappa di posti
 */
export class SeatMap1 {
  public width: number;
  public height: number;
  constructor(public rows: Tile[][]) {
    this.height = rows.length;
    this.width = rows[0].length;
  }

  static parse(data: string) {
    const rows = data.split('\n').map((row) => row.split('') as Tile[]);
    return new SeatMap1(rows);
  }

  at(loc: Loc) {
    if (loc.x < 0 || loc.y < 0 || loc.x >= this.width || loc.y >= this.height)
      return null;
    return this.rows[loc.y][loc.x];
  }

  around(loc: Loc) {
    return AroundTiles.map(([x, y]) => this.at(Loc(loc.x + x, loc.y + y)));
  }

  next() {
    let prev = this.rows;
    let next = [] as Tile[][];
    let diff = 0;

    for (let y = 0; y < this.height; y++) {
      next.push([]);
      for (let x = 0; x < this.width; x++) {
        next[y][x] = this.change(Loc(x, y));
        if (next[y][x] !== prev[y][x]) diff++;
      }
    }

    this.rows = next;

    return {
      changed: diff > 0,
      rows: this.rows
    };
  }

  change(loc: Loc) {
    let cell = this.at(loc);
    if (cell === Tile.Floor) return Tile.Floor;

    // Floor (.) never changes;
    const around = this.around(loc);

    // If a seat is empty (L) and there are no occupied seats adjacent to it, the seat becomes occupied.
    if (cell === Tile.Empty) {
      for (let i = 0; i < around.length; i++) {
        if (around[i] === Tile.Occupied) return Tile.Empty;
      }
      return Tile.Occupied;
    }

    // If a seat is occupied (#) and four or more seats adjacent to it are also occupied, the seat becomes empty.
    if (cell === Tile.Occupied) {
      let occupied = 0;
      for (let i = 0; i < around.length; i++) {
        if (around[i] === Tile.Occupied) occupied++;
      }
      return occupied >= 4 ? Tile.Empty : Tile.Occupied;
    }

    throw new Error(`Unexpected cell ${cell}`);
  }
}
