import fs from 'fs';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input.test2.txt', 'utf-8');

type Instruction =
  | { type: 'mask'; raw: string; mask: Bitmask[] }
  | { type: 'mem'; address: number; value: number };

type Bitmask = { i: number; bit: 0 | 1 | 'X' };

const MASK_CMD = /^mask = ([\w\d]+)$/;
const MEM_CMD = /^mem\[(\d+)\] = (\d+)$/;

function parseInstruction(raw: string): Instruction {
  // Mask
  if (raw.startsWith('mask')) {
    const [_, rawMask] = raw.match(MASK_CMD)!;
    const mask = rawMask
      .split('')
      .reverse()
      .map((bit, i) => ({ i, bit: bit === 'X' ? 'X' : parseInt(bit, 10) }));

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
          const addresses = this.resolve(instruction.address);
          for (const address of addresses) {
            this.memory.set(address, instruction.value);
          }
          break;
      }
    }
  }

  float(bits: string[]) {
    let permutations: string[][] = [];

    // Sostituisco ai bit il bitmask i-esimo
    const apply = (bits: string[], bitmask: Bitmask) => {
      const next = [...bits];
      next[bitmask.i] = String(bitmask.bit);
      return next;
    };

    // Genero le permutazioni per la bitmask i-esima
    const push = (bitmask: Bitmask) => {
      if (permutations.length === 0) {
        permutations = [
          apply(bits, { bit: 0, i: bitmask.i }),
          apply(bits, { bit: 1, i: bitmask.i })
        ];
        return;
      }

      permutations = [
        ...permutations.map((p) => apply(p, { bit: 0 as 0, i: bitmask.i })),
        ...permutations.map((p) => apply(p, { bit: 1 as 1, i: bitmask.i }))
      ];
    };

    for (const bitmask of this.mask) {
      if (bitmask.bit === 'X') push(bitmask);
    }

    let values: number[] = [];
    for (const permutation of permutations) {
      console.log(`NEXT    = ${permutation.reverse().join('')}`);
      values.push(parseInt(permutation.reverse().join(''), 2));
    }
    return values;
  }

  resolve(value: number) {
    const bits = value.toString(2).padStart(36, '0').split('').reverse();
    console.log(`\nMASK    = ${this.maskRaw}`);
    console.log(`BITS(0) = ${value.toString(2).padStart(36, '0')}`);
    for (const bitmask of this.mask) {
      if (bitmask.bit !== 0) {
        bits[bitmask.i] = String(bitmask.bit);
      }
    }
    console.log(`BITS(1) = ${[...bits].reverse().join('')}`);
    return this.float(bits);
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
