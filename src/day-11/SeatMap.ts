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

const AroundTiles: Direction[] = [
  [-1, -1],
  [+0, -1],
  [+1, -1],
  [-1, +0],
  [+1, +0],
  [-1, +1],
  [+0, +1],
  [+1, +1]
];

type Direction = [x: number, y: number];

/**
 * Rappresenta una mappa di posti
 */
export class SeatMap {
  public width: number;
  public height: number;
  constructor(public rows: Tile[][]) {
    this.height = rows.length;
    this.width = rows[0].length;
  }

  static parse(data: string) {
    const rows = data.split('\n').map((row) => row.split('') as Tile[]);
    return new SeatMap(rows);
  }

  at(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null;
    return this.rows[y][x];
  }

  visibleSeat(loc: Loc, [dx, dy]: Direction) {
    let { x, y } = loc;
    let next = this.at(loc.x + dx, loc.y + dy);
    while (next !== Tile.Occupied && next !== Tile.Empty && next != null) {
      x += dx;
      y += dy;
      next = this.at(x, y);
    }

    return next;
  }

  visibles(loc: Loc) {
    return AroundTiles.map((dir) => this.visibleSeat(loc, dir));
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
    let cell = this.at(loc.x, loc.y);

    // Floor (.) never changes;
    if (cell === Tile.Floor) return Tile.Floor;

    const visibles = this.visibles(loc);

    // If a seat is empty (L) and there are no occupied seats adjacent to it, the seat becomes occupied.
    if (cell === Tile.Empty) {
      for (let i = 0; i < visibles.length; i++) {
        if (visibles[i] === Tile.Occupied) return Tile.Empty;
      }
      return Tile.Occupied;
    }

    // If a seat is occupied (#) and five or more seats adjacent to it are also occupied, the seat becomes empty.
    if (cell === Tile.Occupied) {
      let occupied = 0;
      for (let i = 0; i < visibles.length; i++) {
        if (visibles[i] === Tile.Occupied) occupied++;
      }
      return occupied >= 5 ? Tile.Empty : Tile.Occupied;
    }

    throw new Error(`Unexpected cell ${cell}`);
  }
}
