export class Program {
  public instructions: Instruction[];

  // State
  public accumulator = 0;
  public nextIndex = 0;

  constructor(code: string) {
    this.instructions = code.split('\n').map(Instruction.parse);
  }

  public init() {
    this.accumulator = 0;
    this.nextIndex = 0;
  }

  public run() {
    const executed = new Set<Instruction>();

    while (true) {
      const instruction = this.instructions[this.nextIndex];
      if (!instruction) {
        return { completed: true };
      }

      if (executed.has(instruction)) {
        return { completed: false, infiniteLoop: true };
      }

      executed.add(instruction);

      const result = this.runInstruction(instruction);
      this.nextIndex = result.next;
    }
  }

  private runInstruction(instruction: Instruction) {
    switch (instruction.type) {
      case 'nop':
        return { next: this.nextIndex + 1 };
      case 'acc': {
        this.accumulator += instruction.value;
        return { next: this.nextIndex + 1 };
      }
      case 'jmp': {
        return { next: (this.nextIndex += instruction.value) };
      }
    }
  }

  static parse(code: string) {
    return new Program(code);
  }
}

export class Instruction {
  public type: 'jmp' | 'acc' | 'nop';
  public value: number;

  constructor(public code: string) {
    const [type, value] = code.split(' ');
    this.type = type as any;
    this.value = parseInt(value, 10);
  }

  static parse(code: string) {
    return new Instruction(code);
  }
}
