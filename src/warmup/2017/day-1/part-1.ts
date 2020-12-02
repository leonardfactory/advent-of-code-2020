import fs from 'fs';

let input = fs
  .readFileSync(__dirname + '/input.txt', 'utf-8')
  .split('')
  .map((n) => parseInt(n, 10));

// let testNumbers = '1111'.split('').map((n) => parseInt(n, 10));

function solve(numbers: number[]) {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    let next = (i + 1) % numbers.length;
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
