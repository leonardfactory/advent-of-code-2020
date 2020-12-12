import fs from 'fs';
import { WaypointNavigator } from './WaypointNavigator';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input.test.txt', 'utf-8');

function distance(data: string) {
  const navigator = WaypointNavigator.parse(data);
  navigator.route();
  const distance =
    Math.abs(navigator.position.x) + Math.abs(navigator.position.y);
  return distance;
}

console.log(`Manhattan distance is: ${distance(input)}`);
