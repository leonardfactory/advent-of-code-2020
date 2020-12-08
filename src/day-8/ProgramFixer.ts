export class ProgramFixer {
  public instructions: Instruction[];

  // State
  public state: ProgramState = {
    accumulator: 0,
    next: 0
  };

  constructor(code: string | Instruction[]) {
    if (typeof code === 'string') {
      this.instructions = code.split('\n').map(Instruction.parse);
    } else {
      this.instructions = code;
    }
  }

  public init() {
    this.state = {
      accumulator: 0,
      next: 0
    };
  }

  replace(instruction: Instruction, replace: Instruction) {
    const index = this.instructions.indexOf(instruction);
    const replacedInstructions = [...this.instructions];
    replacedInstructions[index] = replace;
    return new ProgramFixer(replacedInstructions);
  }

  public run() {
    const executed = new Set<Instruction>();
    const debug = new Debugger(this.instructions);
    let previous: Instruction | undefined;

    while (true) {
      const instruction = this.instructions[this.state.next];
      if (!instruction) {
        return { completed: true, debug };
      }

      if (executed.has(instruction)) {
        return { completed: false, debug, infiniteLoop: true };
      }

      executed.add(instruction);
      if (previous) debug.add(previous, instruction);

      const nextState = instruction.run(this.state);
      this.state = { ...this.state, ...nextState };
      previous = instruction;
    }
  }

  static parse(code: string) {
    return new ProgramFixer(code);
  }
}

export class Debugger {
  public stack: Instruction[] = [];
  public graph: Map<Instruction, Instruction> = new Map();
  public instructions: Instruction[];

  constructor(instructions: Instruction[]) {
    this.instructions = [...instructions];
  }

  public add(from: Instruction, to: Instruction) {
    this.graph.set(from, to);
    this.stack.push(from);
  }
}

type ProgramState = {
  accumulator: number;
  next: number;
};

export class Instruction {
  public type!: 'jmp' | 'acc' | 'nop';
  public value!: number;

  constructor(public code?: string) {
    if (code) {
      const [type, value] = code.split(' ');
      this.type = type as any;
      this.value = parseInt(value, 10);
    }
  }

  static parse(code: string) {
    return new Instruction(code);
  }

  run(state: ProgramState) {
    switch (this.type) {
      case 'nop': {
        return { next: state.next + 1 };
      }

      case 'acc': {
        return {
          next: state.next + 1,
          accumulator: state.accumulator + this.value
        };
      }

      case 'jmp': {
        return { next: state.next + this.value };
      }
    }
  }

  switch() {
    const instruction = new Instruction();
    instruction.value = this.value;
    if (this.type === 'jmp') instruction.type = 'nop';
    if (this.type === 'nop') instruction.type = 'jmp';
    return instruction;
  }
}
