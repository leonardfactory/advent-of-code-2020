import fs from 'fs';
import { sum } from 'lodash';
import { CustomGroup } from './Custom';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input-test.txt', 'utf-8');

function sumAnswers(data: string) {
  const groups = CustomGroup.parseAll(data);
  const count = sum(groups.map((g) => Object.keys(g.map).length));
  return count;
}

console.log(`Sum is ${sumAnswers(input)}`);
