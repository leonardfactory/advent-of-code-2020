import fs from 'fs';
import { Program } from '../utils/program/Program';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input-test.txt', 'utf-8');

function debug(code: string) {
  const program = Program.parse(code);
  const result = program.run();
  console.log(
    `Completed: ${result.completed} (IL=${result.infiniteLoop}) - Acc is ${program.accumulator}`
  );
}

debug(input);
