import fs from 'fs';
import { Bag } from './Bag';
import { BagGraph } from './BagGraph';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input-test.txt', 'utf-8');

function count(data: string) {
  const bags = data.split('\n').map(Bag.parse);
  const graph = new BagGraph(new Set(bags));
  const matching = graph.traverseUp('shiny gold');
  return matching;
}

const matching = count(input);

console.log(
  `Matching (N. ${matching.length}):\n${matching
    .map((b) => b.color)
    .join('\n')}`
);
