import fs from 'fs';
import { max, min } from 'lodash';
import { format } from 'path';
import { findBug } from './findBug';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input-test.txt', 'utf-8');

type ContiguousSet = {
  from: number;
  values: number[];
  sum: number;
  push(value: number): number;
};

function findWeakness(data: string, length: number) {
  const stream = data.split('\n').map((n) => parseInt(n, 10));
  const bug = findBug(stream, length);

  function createSet(from: number): ContiguousSet {
    return {
      from,
      values: [from],
      sum: from,
      push(value: number) {
        this.sum += value;
        this.values.push(value);
        return this.sum;
      }
    };
  }

  let sets: ContiguousSet[] = [];

  for (let i = 0; i < stream.length; i++) {
    const current = stream[i];

    for (let j = sets.length - 1; j >= 0; j--) {
      const set = sets[j];
      const sum = set.push(current);
      if (sum === bug) return { encoded: encodeWeakness(set), set };
      if (sum > bug) {
        sets.splice(0, j + 1);
        break;
      }
    }

    sets.push(createSet(current));
  }

  return bug;
}

function encodeWeakness(set: ContiguousSet) {
  return Math.min(...set.values) + Math.max(...set.values);
}

console.log(`Weakness is:\n`, findWeakness(input, 25));
