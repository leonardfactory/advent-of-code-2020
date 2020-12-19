import fs from 'fs';
import { result } from 'lodash';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input.test.txt', 'utf-8');

// Tokenization
type Token = '+' | '*' | number | '(' | ')';

function tokenize(data: string) {
  let tokens: Token[] = [];
  let current = '';
  let flags = {
    value: false
  };
  for (let i = 0; i < data.length; i++) {
    const char = data[i];
    if (char === ' ') continue;
    if (char === '(' || char === ')' || char === '+' || char === '*') {
      if (flags.value) {
        tokens.push(parseInt(current, 10));
        flags.value = false;
      }

      tokens.push(char);
      current = '';
      continue;
    }
    // number
    flags.value = true;
    current += char;
  }

  if (flags.value) tokens.push(parseInt(current, 10));

  return tokens;
}

// Parsing
type Value = number;
type Expr = Array<Value | '+' | '*' | Expr>;

function parse(tokens: Token[]) {
  return subparse(tokens, 0)[0];
}

function subparse(tokens: Token[], from: number) {
  let expr = [] as Expr;
  for (let i = from; i < tokens.length; i++) {
    const token = tokens[i];

    if (token === '(') {
      const [subexpr, to] = subparse(tokens, i + 1);
      expr.push(subexpr);
      i = to;
      continue;
    }

    if (token === ')') {
      return [expr, i] as const;
    }

    expr.push(token);
  }
  return [expr, tokens.length - 1] as const;
}

// Evaluation
function evaluate(data: string) {
  const [raw, result] = data.split('=');
  console.log('Expr is', raw);
  const tokens = tokenize(raw);
  // console.dir({ tokens }, { depth: undefined });
  const expr = parse(tokens);
  // console.dir({ expr }, { depth: undefined });
  return [subevaluate(expr), result ? parseInt(result, 10) : null];
}

function subevaluate(expr: Expr) {
  let current: number | undefined;
  let op!: '+' | '*';
  for (const item of expr) {
    if (item === '+' || item === '*') {
      op = item;
      continue;
    }

    let result = Array.isArray(item) ? subevaluate(item) : item;
    // if (Array.isArray(item))
    //   console.dir({ expr: item, result }, { depth: undefined });

    if (current == null) {
      current = result;
      continue;
    }

    current = op === '+' ? current + result : current * result;
  }
  return current!;
}

test.split('\n').forEach((t) => {
  const [found, expected] = evaluate(t);
  console.log(
    `Found: ${found}${
      expected != null ? (expected === found ? ' test ok' : ' test FAILED') : ''
    }`
  );
});

function sum(data: string) {
  return data
    .split('\n')
    .map((raw) => evaluate(raw)[0]!)
    .reduce((tot, v) => tot + v, 0);
}

console.log(`Input expr sum is: ${sum(input)}`);
