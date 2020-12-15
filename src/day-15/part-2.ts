import fs from 'fs';
import { lastIndexOf, map } from 'lodash';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input.test2.txt', 'utf-8');

// Parsing degli input
function parse(data: string) {
  return data.split(',').map((n) => parseInt(n, 10));
}

// Debug
const _p = (n: number) => n.toString().padStart(4, ' ');

// Trova il numero n-esimo
function play(starting: number[]) {
  let spoken: number[] = Array(30000001);
  let recents: Map<number, [number, number | undefined]> = new Map();

  for (let i = 0; i < 30000001; i++) {
    // Numeri iniziali
    if (i < starting.length) {
      spoken[i] = starting[i];
      recents.set(starting[i], [i, undefined]);
      // console.log(`STRT: Turn ${_p(i + 1)} says ${spoken[i]}`);
      continue;
    }

    const [last, prev] = recents.get(spoken[i - 1]) ?? [];
    if (prev == null) {
      spoken[i] = 0;
    } else {
      spoken[i] = last! - prev;
    }
    // console.log(`NEXT: Turn ${_p(i + 1)} says ${spoken[i]} (spoken[i-1]=${spoken[i-1]} last=${last && last+1} prev=${prev && prev+1})`); // prettier-ignore

    // Aggiorno
    const [spokenLast] = recents.get(spoken[i]) ?? [];
    recents.set(spoken[i], [i, spokenLast]);
  }

  return spoken[30000000 - 1];
}

// Testing
// test
//   .split('\n')
//   .map((row) => {
//     const [data, expected] = row.split(':');
//     return [data, parseInt(expected, 10)] as [string, number];
//   })
//   .forEach(([test, expected]) => {
//     const result = play(parse(test));
//     const passed = result === expected;
//     console.log(
//       `Test ${test}: ${result} (${
//         passed ? 'ok' : 'FAIL expected: ' + expected
//       })`
//     );
//   });

console.log(`30000000th number is: ${play(parse(input))}`);
