import fs from 'fs';
import { Biome, Point, Tile } from './Biome';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input-test.txt', 'utf-8');

function navigate(biome: Biome) {
  let position = Point(0, 0);
  let trees = 0;

  while (!biome.isBottom(position)) {
    position = Point(position.x + 3, position.y + 1);
    if (biome.at(position) === Tile.Tree) {
      console.log(`Found tree at (${position.x},${position.y})`);
      trees++;
    }
  }

  return trees;
}

const biome = Biome.parse(input);

console.log(`Number of trees: ${navigate(biome)}`);
