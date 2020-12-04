import fs from 'fs';
import { Biome, Point, Tile } from './Biome';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input-test.txt', 'utf-8');

function navigate(biome: Biome, step: Point) {
  let position = Point(0, 0);
  let trees = 0;

  while (!biome.isBottom(position)) {
    position = Point(position.x + step.x, position.y + step.y);
    if (biome.at(position) === Tile.Tree) {
      // console.log(
      //   `[Step ${step.x},${step.y}] Found tree at (${position.x},${position.y})`
      // );
      trees++;
    }
  }

  return trees;
}

function navigationAverage(biome: Biome, steps: Point[]) {
  return steps.reduce((average, step) => {
    const trees = navigate(biome, step);
    console.log(`[Step ${step.x},${step.y}] Number of trees: ${trees}`);
    return average * trees;
  }, 1);
}

const biome = Biome.parse(input);
const steps = [Point(1, 1), Point(3, 1), Point(5, 1), Point(7, 1), Point(1, 2)];

console.log(`Number of trees in average: ${navigationAverage(biome, steps)}`);
