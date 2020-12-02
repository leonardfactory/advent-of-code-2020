import fs from 'fs';

let input = fs
  .readFileSync(__dirname + '/input.txt', 'utf-8')
  .split('')
  .map((n) => parseInt(n, 10));

// input = '123123'.split('').map((n) => parseInt(n, 10));

function solve(numbers: number[]) {
  let sum = 0;
  const step = numbers.length / 2; // "Fortunately, your list has an even number of elements."

  for (let i = 0; i < numbers.length; i++) {
    let next = (i + step) % numbers.length;
    // console.log(`#${i} - ${numbers[i]},${numbers[next]}`);
    if (numbers[i] === numbers[next]) {
      sum += numbers[i];
    }
  }
  return sum;
}

const captcha = solve(input);
console.log(`Input size: ${input.length} (ex: ${input.slice(0, 10)})`);
console.log(`Captcha solution: ${captcha}`);
