import fs from 'fs';

const input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
const test1 = `5 1 9 5
7 5 3
2 4 6 8`;

function readSheet(input: string) {
  return input
    .split('\n')
    .map((row) => row.split(/\s+/).map((cell) => parseInt(cell, 10)));
}

function checksum(sheet: number[][]) {
  let sum = 0;
  for (const row of sheet) {
    const min = Math.min(...row);
    const max = Math.max(...row);
    sum += max - min;
  }
  return sum;
}

console.log(`Checksum is: ${checksum(readSheet(input))}`);
