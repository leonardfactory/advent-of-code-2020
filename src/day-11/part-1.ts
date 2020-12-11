import fs from 'fs';
import { SeatMap1, Tile } from './SeatMap1';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input.test.txt', 'utf-8');

function stabilize(data: string) {
  const map = SeatMap1.parse(data);
  let changed = true;
  while (changed) {
    const result = map.next();
    changed = result.changed;
  }

  // Count dopo la stabilizzazione
  let occupied = 0;
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (map.rows[y][x] === Tile.Occupied) occupied++;
    }
  }

  return occupied;
}

console.log(`Occupied after stabilization: ${stabilize(input)}`);
