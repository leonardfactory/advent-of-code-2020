import fs from 'fs';
import { ProgramFixer } from './ProgramFixer';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input-test.txt', 'utf-8');

function fix(code: string) {
  const program = ProgramFixer.parse(code);
  const result = program.run();
  console.log(
    `Completed: ${result.completed} (IL=${result.infiniteLoop}) - Acc is ${program.state.accumulator}`
  );

  const debug = result.debug;
  for (const instruction of debug.instructions) {
    // Non sostituibili
    if (instruction.type === 'acc') continue;

    const replace = instruction.switch();
    const index = debug.stack.indexOf(instruction);
    const nextIndex = replace.run({ next: index, accumulator: -1 }).next;
    const nextInstruction = debug.stack[nextIndex];

    if (nextIndex < index) {
      console.log(`Skip instruction ${instruction.code} (recursive)`);
      continue;
    }

    // Provo il programma
    const fix = program.replace(instruction, replace);
    const fixResult = fix.run();
    if (fixResult.completed) {
      return `Solution found: ${instruction.code} -> ${replace.code}, Acc: ${fix.state.accumulator}`;
    }
  }

  return `No solution found.`;
}

console.log(fix(input));
