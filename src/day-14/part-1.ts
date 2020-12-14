import fs from 'fs';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input.test.txt', 'utf-8');

type Instruction =
  | { type: 'mask'; raw: string; mask: Bitmask[] }
  | { type: 'mem'; address: number; value: number };

type Bitmask = { i: number; bit: 0 | 1 };

const MASK_CMD = /^mask = ([\w\d]+)$/;
const MEM_CMD = /^mem\[(\d+)\] = (\d+)$/;

function parseInstruction(raw: string): Instruction {
  // Mask
  if (raw.startsWith('mask')) {
    const [_, rawMask] = raw.match(MASK_CMD)!;
    const mask = rawMask
      .split('')
      .reverse()
      .map((bit, i) => ({ i, bit: bit === 'X' ? null : parseInt(bit, 10) }))
      .filter((bit) => bit.bit != null);

    return { type: 'mask', raw: rawMask, mask: mask as Bitmask[] };
  }

  // Mem
  if (raw.startsWith('mem')) {
    const [_, rawAddr, rawVal] = raw.match(MEM_CMD)!;
    return {
      type: 'mem',
      address: parseInt(rawAddr, 10),
      value: parseInt(rawVal, 10)
    };
  }

  throw new Error(`CMD ${raw} not recognized`);
}

// Programma per eseguire le instructions
class InitProgram {
  instructions: Instruction[];
  mask: Bitmask[] = [];
  maskRaw: string = '';
  memory: Map<number, number> = new Map();

  constructor(data: string) {
    this.instructions = data.split('\n').map(parseInstruction);
  }

  run() {
    for (const instruction of this.instructions) {
      switch (instruction.type) {
        case 'mask':
          this.mask = instruction.mask;
          this.maskRaw = instruction.raw;
          break;

        case 'mem':
          this.memory.set(instruction.address, this.change(instruction.value));
          break;
      }
    }
  }

  change(value: number) {
    const bits = value.toString(2).padStart(36, '0').split('').reverse();
    console.log(`MASK    = ${this.maskRaw}`);
    console.log(`BITS(0) = ${value.toString(2).padStart(36, '0')}`);
    for (const bitmask of this.mask) {
      bits[bitmask.i] = String(bitmask.bit);
    }
    const next = parseInt(bits.reverse().join(''), 2);
    console.log(`BITS(1) = ${next.toString(2).padStart(36, '0')}\n`);
    return next;
  }

  sum() {
    return Array.from(this.memory.entries()).reduce(
      (sum, [address, value]) => sum + value,
      0
    );
  }
}

// Esecuzione
function sum(data: string) {
  const program = new InitProgram(data);
  program.run();
  return program.sum();
}

console.log(`Sum is: ${sum(input)}`);
