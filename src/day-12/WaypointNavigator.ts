// Vettori e posizioni
type Point = { x: number; y: number };
type Vector = { x: number; y: number };

// Direzioni
export type Direction = 'N' | 'S' | 'E' | 'W';
const Directions = ['N', 'E', 'S', 'W'] as Direction[];

function directionVector(d: Direction): Vector {
  switch (d) {
    case 'N':
      return { x: 0, y: +1 };
    case 'S':
      return { x: 0, y: -1 };
    case 'W':
      return { x: -1, y: 0 };
    case 'E':
      return { x: +1, y: 0 };
  }
}

// Debug
function dp({ x, y }: Point) {
  return `(x: ${x.toString().padStart(5)}, y: ${y.toString().padStart(5)})`;
}

// Istruzioni
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

// Navigator
export class WaypointNavigator {
  public position: Point = { x: 0, y: 0 };
  public waypoint: Point = { x: 10, y: 1 };

  constructor(public facing: Direction, public instructions: Instruction[]) {}

  static parse(data: string) {
    return new WaypointNavigator(
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
      const prev = {
        position: { ...this.position },
        waypoint: { ...this.waypoint }
      };
      this.apply(instruction);
      console.log(`${instruction.code()}:
        Position: ${dp(prev.position)} -> ${dp(this.position)}
        Waypoint: ${dp(prev.waypoint)} -> ${dp(this.waypoint)}
      `);
    }
  }

  apply(instruction: Instruction) {
    switch (instruction.action) {
      case 'N':
      case 'S':
      case 'E':
      case 'W':
        const vector = directionVector(instruction.action);
        this.waypoint.x += vector.x * instruction.value;
        this.waypoint.y += vector.y * instruction.value;
        return;

      case 'R':
      case 'L':
        const factor = instruction.action === 'L' ? 1 : -1;
        const rads = (factor * (instruction.value * Math.PI)) / 180;

        const { x, y } = this.waypoint;
        this.waypoint = {
          x: Math.round(x * Math.cos(rads) - y * Math.sin(rads)),
          y: Math.round(x * Math.sin(rads) + y * Math.cos(rads))
        };
        return;

      case 'F':
        this.position.x += instruction.value * this.waypoint.x;
        this.position.y += instruction.value * this.waypoint.y;
        return;
    }
  }
}
