export type Direction = 'N' | 'S' | 'E' | 'W';

const Directions = ['N', 'E', 'S', 'W'] as Direction[];

function directionVector(d: Direction) {
  switch (d) {
    case 'N':
      return { x: 0, y: -1 };
    case 'S':
      return { x: 0, y: +1 };
    case 'W':
      return { x: -1, y: 0 };
    case 'E':
      return { x: +1, y: 0 };
  }
}

function dp({ x, y }: { x: number; y: number }) {
  return `(x: ${x.toString().padStart(5)}, y: ${y.toString().padStart(5)})`;
}

export class Instruction {
  constructor(
    public action: 'N' | 'S' | 'E' | 'W' | 'R' | 'L' | 'F',
    public value: number
  ) {}

  code() {
    return `${this.action}${this.value.toString().padEnd(5)}`;
  }

  degreesToSteps() {
    return this.value / 90;
  }
}

export class Navigator {
  public x = 0;
  public y = 0;

  constructor(public facing: Direction, public instructions: Instruction[]) {}

  static parse(data: string) {
    return new Navigator(
      'E',
      data
        .split('\n')
        .map(
          (code) =>
            new Instruction(code.charAt(0) as any, parseInt(code.substr(1), 10))
        )
    );
  }

  route() {
    for (const instruction of this.instructions) {
      const prev = { x: this.x, y: this.y };
      this.apply(instruction);
      console.log(`${instruction.code()}: ${dp(prev)} -> ${dp(this)}`);
    }
  }

  apply(instruction: Instruction) {
    switch (instruction.action) {
      case 'N':
      case 'S':
      case 'E':
      case 'W':
        const vector = directionVector(instruction.action);
        this.x += vector.x * instruction.value;
        this.y += vector.y * instruction.value;
        return;

      case 'R':
      case 'L':
        const i = Directions.indexOf(this.facing);
        const steps = instruction.degreesToSteps();
        const next =
          instruction.action === 'R'
            ? i + steps
            : i + Directions.length - steps;

        this.facing = Directions[next % Directions.length];
        return;

      case 'F':
        const forward = directionVector(this.facing);
        this.x += forward.x * instruction.value;
        this.y += forward.y * instruction.value;
        return;
    }
  }
}
