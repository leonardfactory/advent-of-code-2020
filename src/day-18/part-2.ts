import fs from 'fs';
import { result } from 'lodash';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input.test2.txt', 'utf-8');

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

let rs = (n: number) => ' '.repeat(n);
let pn = (n: number) => n.toString().padStart(3, ' ');
let pe = (e: Expr): string =>
  e.map((e) => (Array.isArray(e) ? '(' + pe(e) + ')' : e)).join(' ');

let it = 0;

function subparse(
  tokens: Token[],
  from: number,
  op?: '+' | '*',
  isop?: boolean
) {
  // it++;
  // if (it > 50) throw new Error('stop');
  let expr = [] as Expr;
  let pardiff = 1;
  for (let i = from; i < tokens.length; i++) {
    const token = tokens[i];
    // console.log(`[${pn(from)}] token: ${token}@${i}`);

    if (token === '(') {
      console.log(`[${pn(from)}] ${rs(i)}: apri (`);
      const [subexpr, to] = subparse(tokens, i + 1);
      console.log(`[${pn(from)}] ${rs(i)}: chiusa tonda ), risolta in (${pe(subexpr)}), continuo da ${tokens[to]}@${to}`); // prettier-ignore
      expr.push(subexpr);
      pardiff = to - i;
      i = to;
      continue;
    }

    if (token === ')') {
      return [expr, isop ? i - 1 : i] as const;
    }

    if (token === '*' && op === '+') {
      return [expr, i - 1] as const;
    }

    if (token === '+' && op !== '+') {
      expr.pop();
      console.log(`[${pn(from)}] ${rs(i)}: trovata espressione '+' in contesto '*', apro tonda prec.`); // prettier-ignore
      const [subexpr, to] = subparse(
        tokens,
        i - (tokens[i - 1] === ')' ? pardiff + 1 : 1),
        token,
        true
      );
      console.log(`[${pn(from)}] ${rs(i)}: risolta espressione '+' (${pe(subexpr)}) chiudo tonda prec., continuo da ${tokens[to]}@${to}`); // prettier-ignore
      expr.push(subexpr);
      i = to;
      continue;
    }

    if (token === '+' || token === '*') op = token;

    expr.push(token);
  }
  return [expr, tokens.length - 1] as const;
}

function subparse2(
  tokens: Token[],
  from: number,
  op?: '+' | '*',
  isop?: boolean
) {
  // it++;
  // if (it > 50) throw new Error('stop');
  let expr = [] as Expr;
  for (let i = from; i < tokens.length; i++) {
    const token = tokens[i];

    if (token === '(') {
      console.log(`s${pn(i)}: ${rs(i)} -> ${token} search ${op ?? '_'}`);
      const [subexpr, to] = subparse(tokens, i + 1);
      console.log(`s${pn(i)}: ${rs(i)} -> ) solve ${op ?? '_'} (${pe(subexpr)})`); // prettier-ignore
      expr.push(subexpr);
      i = to;
      continue;
    }

    if (token === ')') {
      console.log(`)${pn(i)}: ${rs(from)} <- close ) ${isop}`); // prettier-ignore
      return [expr, isop ? i - 1 : i] as const;
    }

    if (token === '*' && op === '+') {
      console.log(`*${pn(i)}: ${rs(from)} <- close * ${op ?? '_'}`); // prettier-ignore
      return [expr, i - 1] as const;
    }

    if (token === '+' && op !== '+') {
      expr.pop();
      console.log(`t${pn(i - 1)}: ${rs(i - 1)} -> search (${token}, from ${from})`); // prettier-ignore
      const [subexpr, to] = subparse(tokens, i - 1, token, true);
      console.log(`t${pn(i - 1)}: ${rs(i - 1)} -> ${pe(subexpr)} (${op ?? '_'}, ${token}, from ${from})`); // prettier-ignore
      expr.push(subexpr);
      i = to;
      continue;
    }

    if (token === '+' || token === '*') op = token;

    if (op && (token === '+' || token === '*') && token !== op) {
      console.error(`WTF? ${pn(i)} -> token ${token} vs op ${op}`);
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
  // for (let i = 0; i < tokens.length; i++) {
  //   console.log(`Token ${pn(i)}:${rs(i)} ${tokens[i]}`);
  // }
  const expr = parse(tokens);
  console.dir({ expr }, { depth: undefined });
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
