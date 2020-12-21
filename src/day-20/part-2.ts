import { transcode } from 'buffer';
import fs from 'fs';
import { difference, flatten, groupBy, uniq } from 'lodash';
import { array2d } from '../utils/array';

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

function transformMap(map: Cell[][], transform: Transform) {
  const [deg, flip] = transform;

  let next = Array(map.length)
    .fill(null)
    .map(() => [] as Cell[]);

  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map.length; j++) {
      let { i: ni, j: nj } = transformCoords(
        { size: map.length },
        transform,
        i,
        j
      );
      next[i][j] = map[ni][nj];
    }
  }

  return next;
}

function transformCoords(
  tile: { size: number },
  t: Transform,
  i: number,
  j: number
) {
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

const invertBorder = (border: 'top' | 'left' | 'right' | 'bottom') => {
  return border === 'top'
    ? 'bottom'
    : border === 'left'
    ? 'right'
    : border === 'right'
    ? 'left'
    : border === 'bottom'
    ? 'top'
    : 'top';
};

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
        other,
        tk,
        matches: trans_t.borders[tk] === trans_o.borders[invertBorder(tk)]
      };
    })
    .filter((b) => b.matches);
}

function align(data: string) {
  const tiles = parse(data);
  const hash = new Map<number, Tile>();
  for (const tile of tiles) hash.set(tile.id, tile);

  const trans = transformAll(tiles);

  const matches = new Map<number, Match[]>();

  for (let i = 0; i < tiles.length; i++) {
    let ms = [] as Match[];
    for (let j = 0; j < tiles.length; j++) {
      if (i === j) continue;
      const matches = match(trans, tiles[i], tiles[j]);
      ms.push(...matches);
    }
    matches.set(tiles[i].id, ms);
    // console.dir(ms, { depth: undefined });
  }

  let corners = [] as Tile[];
  matches.forEach((ms, id) => {
    const groups = groupBy(ms, (o) => o.t);
    const isCorner = Object.values(groups).filter(
      (g) => difference(borderKeys, uniq(g.map((gi) => gi.tk))).length >= 2
    );
    if (isCorner.length > 0) {
      console.log(`\nPlausibile corner ${id}`);
      corners.push(hash.get(id)!);
      return;
    }
  });

  console.log(`Corners:`);
  corners.forEach((corner) => {
    console.log(` Tile ${corner.id}:\n${pt(corner)}\n`);
  });
  const [topLeftCorner, ...otherCorners] = corners;

  // mappa
  const solution = array2d<[Transform, Tile]>(Math.sqrt(tiles.length));
  // solution[0][0] = corners[0];

  let solutions = [] as [Transform, Tile][][][];
  solve(topLeftCorner, solutions, trans, matches, solution, [], 0, -1);
  for (const sol of solutions) {
    console.log(`Solution ->`);
    const map = toMap(trans, sol);
    for (const line of map) {
      console.log(line.join(''));
    }
    console.log('\n');

    // monster
    for (const t of transforms) {
      const transformedMap = transformMap(map, t);
      const monsterCount = findMonster(transformedMap);
      console.log('Monster count -> ', monsterCount);
    }

    printSolution(trans, sol);
  }
}

function toMap(trans: TransTiles, solution: [Transform, Tile][][]) {
  let map = [] as Cell[][];
  for (let i = 0; i < solution.length; i++) {
    for (let j = 0; j < solution.length; j++) {
      const [transform, tile] = solution[i][j];
      const ttile = trans.get(tile)!.get(transform)!;

      for (let y = 0; y < ttile.rows.length - 2; y++) {
        let ymap = y + i * (ttile.rows.length - 2);
        if (!map[ymap]) {
          map[ymap] = [] as Cell[];
        }

        for (let x = 0; x < ttile.rows.length - 2; x++) {
          map[ymap].push(ttile.rows[y + 1][x + 1]);
        }
      }
    }
  }
  return map;
}

// trova le istanze del mostro
const monster = fs
  .readFileSync(__dirname + '/monster.txt', 'utf-8')
  .split('\n')
  .map((l) => l.split('')) as Cell[][];

function findMonster(map: Cell[][]) {
  let marked = array2d<number>(map.length);

  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map.length; j++) {
      if (map[i][j] === '#' && marked[i][j] == null) marked[i][j] = 1;

      if (i > map.length - monster.length) continue;
      if (j > map.length - monster[0].length) continue;

      // Cerco il mostro
      let found = true;
      for (let mi = 0; mi < monster.length; mi++) {
        for (let mj = 0; mj < monster[0].length; mj++) {
          const map_cell = map[i + mi][j + mj];
          const mon_cell = monster[mi][mj];

          if (mon_cell === '#' && map_cell !== '#') {
            found = false;
            break;
          }
        }
        if (!found) break;
      }

      if (found) {
        console.log(`Found at (${i},${j})`);
        for (let mi = 0; mi < monster.length; mi++) {
          for (let mj = 0; mj < monster[0].length; mj++) {
            if (monster[mi][mj] === '#') marked[i + mi][j + mj] = -1;
          }
        }
      }
    }
  }

  let total = 0;
  for (let i = 0; i < marked.length; i++) {
    for (let j = 0; j < marked.length; j++) {
      if (marked[i][j] === 1) total++;
    }
  }
  return total;
}

const printSolution = (trans: TransTiles, solution: [Transform, Tile][][]) => {
  for (let i = 0; i < solution.length; i++) {
    let buffers = [] as string[];
    let namebuf = '';

    for (let j = 0; j < solution.length; j++) {
      const [transform, tile] = solution[i][j];
      namebuf += ` ${tile.id}      `;
      const ttile = trans.get(tile)!.get(transform)!;

      for (let y = 0; y < ttile.rows.length; y++) {
        if (!buffers[y]) {
          buffers[y] = '';
        } else {
          buffers[y] += ' ';
        }

        for (let x = 0; x < ttile.rows.length; x++) {
          buffers[y] += ttile.rows[y][x];
        }
      }
    }

    console.log(namebuf);
    for (let buffer of buffers) {
      console.log(buffer);
    }
    console.log('');
  }
};

// solve
function solve(
  topLeftCorner: Tile,
  solutions: [Transform, Tile][][][],
  trans: TransTiles,
  matches: Map<number, Match[]>,
  partial: [Transform, Tile][][],
  used: Tile[],
  i: number,
  j: number
) {
  let overflow = j + 1 >= partial.length;
  let ni = overflow ? i + 1 : i;
  let nj = overflow ? 0 : j + 1;

  if (ni >= partial.length) {
    solutions.push(partial);
    // console.log(`Found solution`);
    return;
  }

  let matchingTop = [] as [Transform, Tile][];
  if (ni > 0) {
    let mi = ni - 1;
    let mj = nj;

    let [transform, tile] = partial[mi][mj];
    for (const match of matches.get(tile.id)!) {
      if (used.includes(match.other)) continue;
      if (match.t === transform && match.tk === 'bottom') {
        matchingTop.push([match.o, match.other]);
      }
    }
  }

  let matchingLeft = [] as [Transform, Tile][];
  if (nj > 0) {
    let mi = ni;
    let mj = nj - 1;

    let [transform, tile] = partial[mi][mj];
    for (const match of matches.get(tile.id)!) {
      if (used.includes(match.other)) continue;
      if (match.t === transform && match.tk === 'right') {
        matchingLeft.push([match.o, match.other]);
      }
    }
  }

  let matchingCorners = [] as [Transform, Tile][];
  if (ni === 0 && nj === 0) {
    for (const tran of trans.get(topLeftCorner)!) {
      let [transform, tile] = tran;
      matchingCorners.push([transform, topLeftCorner]);
    }
  }

  // unisco
  let finalMatching = [] as [Transform, Tile][];
  if (ni > 0 && nj > 0) {
    for (let mt of matchingTop) {
      for (let ml of matchingLeft) {
        if (mt[0] === ml[0] && mt[1] === ml[1]) finalMatching.push(mt);
      }
    }
  } else if (ni > 0) {
    finalMatching = matchingTop;
  } else if (nj > 0) {
    finalMatching = matchingLeft;
  } else {
    finalMatching = matchingCorners;
  }

  // provo
  for (const m of finalMatching) {
    let next = array2d<[Transform, Tile]>(partial.length);
    for (let ci = 0; ci <= i; ci++) {
      for (let cj = 0; cj < partial.length; cj++) {
        next[ci][cj] = partial[ci][cj];
      }
    }
    next[ni][nj] = m;
    solve(
      topLeftCorner,
      solutions,
      trans,
      matches,
      next,
      [...used, m[1]],
      ni,
      nj
    );
  }
}

console.log(`Multiplication from corners is: `, align(input));
