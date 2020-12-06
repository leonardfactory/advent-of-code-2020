import fs from 'fs';
import { sum } from 'lodash';
import { CustomGroup } from './Custom';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input-test.txt', 'utf-8');

function sumAgrees(data: string) {
  const groups = CustomGroup.parseAll(data);
  const count = sum(groups.map((g) => g.agrees.length));
  return count;
}

console.log(`Agreement is ${sumAgrees(input)}`);
