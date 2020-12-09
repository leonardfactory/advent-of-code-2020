import fs from 'fs';
import { findBug } from './findBug';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input-test.txt', 'utf-8');

console.log(`Bug for weakness is:\n`, findBug(input, 25));
