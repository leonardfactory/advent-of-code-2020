import fs from 'fs';

const input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
const test1 = `5 9 2 8
9 4 7 3
3 8 6 5`;

function readSheet(input: string) {
  return input
    .split('\n')
    .map((row) => row.split(/\s+/).map((cell) => parseInt(cell, 10)));
}

function evensum(sheet: number[][]) {
  let sum = 0;
  for (const row of sheet) {
    sum += evenrow(row);
  }
  return sum;
}

function evenrow(row: number[]) {
  for (let i = 0; i < row.length; i++) {
    for (let j = i + 1; j < row.length; j++) {
      let [min, max] = row[i] < row[j] ? [row[i], row[j]] : [row[j], row[i]];
      if (max % min === 0) {
        console.log(`Found on row (${row}): ${max} % ${min} = ${max / min}`);
        return max / min;
      }
    }
  }
  throw new Error('Missing even on row:' + row);
}

console.log(`Evensum is: ${evensum(readSheet(input))}`);
