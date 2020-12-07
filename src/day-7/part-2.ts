import fs from 'fs';
import { Bag } from './Bag';
import { BagGraph } from './BagGraph';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input-test.txt', 'utf-8');
let test2 = fs.readFileSync(__dirname + '/input-test2.txt', 'utf-8');

function count(data: string) {
  const bags = data.split('\n').map(Bag.parse);
  const graph = new BagGraph(new Set(bags));
  return graph.traverse('shiny gold');
}

console.log(`Count is ${count(input)}`);
