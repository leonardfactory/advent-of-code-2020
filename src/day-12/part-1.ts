import fs from 'fs';
import { Navigator } from './Navigator';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input.test.txt', 'utf-8');

function distance(data: string) {
  const navigator = Navigator.parse(data);
  navigator.route();
  const distance = Math.abs(navigator.x) + Math.abs(navigator.y);
  console.log(`(x: ${navigator.x}, y: ${navigator.y})`);
  return distance;
}

console.log(`Manhattan distance is: ${distance(input)}`);
