export enum Tile {
  Tree = '#',
  Open = '#'
}

/** 0,0 is top left */
export interface Point {
  x: number;
  y: number;
}

export function Point(x: number, y: number) {
  return { x, y } as Point;
}

export class Biome {
  private tilesWidth: number;
  private tilesHeight: number;

  constructor(public tiles: Tile[][]) {
    this.tilesWidth = tiles[0].length;
    this.tilesHeight = tiles.length;
  }

  static parse(data: string) {
    const tiles = data.split('\n').map((row) => row.split('') as Tile[]);
    return new Biome(tiles);
  }

  at(point: Point) {
    const [x, y] = [point.x % this.tilesWidth, point.y];
    return this.tiles[y][x];
  }

  isBottom(point: Point) {
    return point.y >= this.tilesHeight - 1;
  }
}
