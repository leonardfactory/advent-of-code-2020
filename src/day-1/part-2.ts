import fs from 'fs';

const numbers = fs
  .readFileSync(__dirname + '/input.txt', 'utf-8')
  .split('\n')
  .map((n) => parseInt(n, 10));

const sorted = numbers.sort((a, b) => a - b);

let found = false;
let iterations = 0;

for (let i = 0; i < sorted.length; i++) {
  for (let j = 0; j < sorted.length; j++) {
    for (let k = 0; k < sorted.length; k++) {
      iterations++;
      if (sorted[i] + sorted[j] + sorted[k] > 2020) break;
      if (sorted[i] + sorted[j] + sorted[k] === 2020) {
        console.log(
          `Numbers ${sorted[i]}, ${sorted[j]}, ${sorted[k]}: ${
            sorted[i] * sorted[j] * sorted[k]
          }`
        );
        found = true;
        break;
      }
    }
    if (found) break;
  }
  if (found) break;
}

console.log(`Stats: Iterations: ${iterations}, Input: ${numbers.length}`);
