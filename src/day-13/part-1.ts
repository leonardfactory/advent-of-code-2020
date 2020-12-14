import fs from 'fs';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input.test.txt', 'utf-8');

function parse(data: string) {
  const raw = data.split('\n');
  return {
    earliest: parseInt(raw[0], 10),
    lines: raw[1]
      .split(',')
      .filter((l) => l != 'x')
      .map((l) => parseInt(l, 10))
  };
}

function solve(data: string) {
  const { earliest, lines } = parse(data);
  let min = Number.POSITIVE_INFINITY;
  let minLine = -1;
  for (const line of lines) {
    const timestamp = Math.ceil(earliest / line) * line;
    if (timestamp < min) {
      min = timestamp;
      minLine = line;
    }
  }

  return { min, minLine, value: (min - earliest) * minLine };
}

console.log(`Bus schedule is:`, solve(input));
