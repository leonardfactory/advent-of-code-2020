import fs from 'fs';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input-test.txt', 'utf-8');

function jolts(data: string) {
  const adapters = data
    .split('\n')
    .map((n) => parseInt(n, 10))
    .sort((a, b) => a - b);

  // Adattatore
  adapters.unshift(0);

  let diff1 = 0;
  let diff3 = 0;
  for (let i = 1; i < adapters.length; i++) {
    if (adapters[i] - adapters[i - 1] === 1) diff1++;
    if (adapters[i] - adapters[i - 1] === 3) diff3++;
    if (adapters[i] - adapters[i - 1] > 3) throw new Error('wtf diff ' + i);
  }

  // Device
  diff3++;

  return { diff1, diff3, factor: diff1 * diff3 };
}

console.log(`Jolts:`, jolts(input));
