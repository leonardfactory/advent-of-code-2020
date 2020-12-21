import { transcode } from 'buffer';
import fs from 'fs';
import { difference, flatten, groupBy, uniq } from 'lodash';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input.test.txt', 'utf-8');

// typings
type Cell = '#' | '.';
type Tile = ReturnType<typeof parse>[0];

// debug
const pt = (tile: Tile) => tile.rows.map((r) => r.join('')).join('\n');

// parsing
function parse(data: string) {
  return data.split('\n\n').map((raw) => {
    const [desc, ...rows] = raw.split('\n');
    const tile = {
      id: parseInt(desc.replace(/[^\d]+/g, ''), 10),
      rows: rows.map((row) => row.split('') as Cell[])
    };

    return {
      ...tile,
      size: rows.length,
      borders: borders(tile.rows)
    };
  });
}

// borders
function borders(rows: Cell[][]) {
  return {
    top: rows[0].join(''),
    bottom: rows[rows.length - 1].join(''),
    left: rows.map((r) => r[0]).join(''),
    right: rows.map((r) => r[r.length - 1]).join('')
  };
}

// rotation and flipping
const borderKeys = ['top', 'left', 'bottom', 'right'] as const;
type Deg = 0 | 90 | 180 | 270;
type Flip = 0 | 1;
type Transform = [Deg, Flip];

const transforms = [
  [0, 0],
  [90, 0],
  [180, 0],
  [270, 0],
  [0, 1],
  [90, 1],
  [180, 1],
  [270, 1]
] as Transform[];

// pre compute transforms
type TransTiles = ReturnType<typeof transformAll>;
function transformAll(tiles: Tile[]) {
  let map = new Map<Tile, Map<Transform, Tile>>();
  for (const tile of tiles) {
    map.set(tile, new Map());
    let tt = map.get(tile)!;
    for (const t of transforms) {
      tt.set(t, transform(tile, t));
    }
  }
  return map;
}

function transform(tile: Tile, transform: Transform) {
  const [deg, flip] = transform;

  let next = Array(tile.rows.length)
    .fill(null)
    .map(() => [] as Cell[]);

  for (let i = 0; i < tile.rows.length; i++) {
    for (let j = 0; j < tile.rows.length; j++) {
      let { i: ni, j: nj } = transformCoords(tile, transform, i, j);
      next[i][j] = tile.rows[ni][nj];
    }
  }

  return {
    ...tile,
    rows: next,
    borders: borders(next)
  };
}

function transformCoords(tile: Tile, t: Transform, i: number, j: number) {
  const deg = t[0];
  const flip = t[1];

  if (flip) i = tile.size - 1 - i;

  switch (deg) {
    case 0:
      return { i, j };
    case 90:
      return { i: tile.size - 1 - j, j: i };
    case 180:
      return { i: tile.size - 1 - i, j: tile.size - 1 - j };
    case 270:
      return { i: j, j: tile.size - 1 - i };
  }
}

// calculate correspondencies
const matrix = flatten(
  transforms.map((t) =>
    flatten(transforms.map((o) => borderKeys.map((tk) => ({ t, o, tk }))))
  )
);

type Match = ReturnType<typeof match>[0];
function match(trans: TransTiles, tile: Tile, other: Tile) {
  return matrix
    .map(({ t, o, tk }) => {
      const trans_t = trans.get(tile)!.get(t)!;
      const trans_o = trans.get(other)!.get(o)!;
      return {
        oid: other.id,
        t,
        o,
        tk,
        matches: borderKeys.filter(
          (ok) => trans_t.borders[tk] === trans_o.borders[ok]
        )
      };
    })
    .filter((b) => b.matches.length > 0);
}

function align(data: string) {
  const tiles = parse(data);
  const hash = new Map<number, Tile>();
  for (const tile of tiles) hash.set(tile.id, tile);

  const trans = transformAll(tiles);

  const matches = new Map<number, Match[]>();

  for (let i = 0; i < tiles.length; i++) {
    let ms = [] as Match[];
    console.log(`Tile ${tiles[i].id}:`);
    for (let j = 0; j < tiles.length; j++) {
      if (i === j) continue;
      const matches = match(trans, tiles[i], tiles[j]);
      ms.push(...matches);
    }
    matches.set(tiles[i].id, ms);
    // console.dir(ms, { depth: undefined });
    console.log('\n\n');
  }

  let mul = 1;
  matches.forEach((other, id) => {
    const groups = groupBy(other, (o) => o.t);
    const missing = Object.values(groups).filter(
      (g) => difference(borderKeys, uniq(g.map((gi) => gi.tk))).length >= 2
    );
    if (missing.length > 0) {
      console.log(`\nPlausibile corner ${id}:`, missing.length);
      mul *= id;
      // console.dir(groups, { depth: undefined });
    }
  });

  return mul;
}

console.log(`Multiplication from corners is: `, align(input));
