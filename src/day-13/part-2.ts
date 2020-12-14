import { time } from 'console';
import fs from 'fs';
import { maxBy } from 'lodash';
import { listenerCount } from 'process';

let input = fs.readFileSync(__dirname + '/input2.txt', 'utf-8');
let tests = parseTests(
  fs.readFileSync(__dirname + '/input2.test.txt', 'utf-8')
);

// G.C.D.
function gcd(a: number, b: number) {
  a = Math.abs(a);
  b = Math.abs(b);
  if (b > a) [a, b] = [b, a];
  while (true) {
    if (b == 0) return a;
    a %= b;
    if (a == 0) return b;
    b %= a;
  }
}

function lcm(...numbers: number[]) {
  let first = numbers.shift()!;
  while (numbers.length > 0) {
    let second = numbers.shift()!;
    first = Math.abs(first * second) / gcd(first, second);
  }
  return first;
}

function parse(raw: string) {
  return raw
    .split(',')
    .map((line, i) => ({ line, offset: i }))
    .filter((line) => line.line !== 'x')
    .map((line) => ({ ...line, line: parseInt(line.line, 10) }));
}

function parseTests(raw: string) {
  return raw
    .split('\n')
    .map((row) => row.split(':') as [string, string])
    .map(([list, expected]) => ({ list, expected }));
}

const _ns = (n: number) => n.toString().padStart(5);
const _ne = (n: number) => n.toString().padEnd(5);

/*      
      (4,0)  X   4     8    12    16    20    24   28   32   36  40   44
      (3,0)  X  3   6   9   12  15   18   21  24 27  30  33   36
      (5,4)  X     5     10     15      20     25    30    35    40    45

      (3,6)  X  3   6   9   12  15   18   21  24 27  30
      (5,0)  X     5     10     15      20     25    30    35    40    45

      T = 10
      diff = 2
      offset = 4
      T' = 10 - 3
*/
function solve(data: string) {
  const constraints = parse(data);

  // function verify(at: number) {
  //   const timestamp =
  //     Math.floor(at / constraints[0].line) * constraints[0].line;

  //   for (const c of constraints) {
  //     const tc = Math.ceil(timestamp / c.line) * c.line;
  //     if (tc - timestamp !== c.offset) return false;
  //   }
  //   return true;
  // }

  const zero = constraints[0];
  console.log(`Zero: ${zero.line} (off.${zero.offset} = 0)`);

  const periods = constraints
    .filter((c) => c.offset !== 0)
    .map((c) => {
      const period = lcm(zero.line, c.line);

      const z_period = period / zero.line;
      const c_period = period / c.line;
      // console.log(`Constraint (${c.line} off.${c.offset}) -> period ${period}, c_period ${c_period}`); // prettier-ignore

      let c_steps!: number;
      let c_timestamp!: number;
      let cz_steps!: number;
      let cz_timestamp!: number;

      for (let i = 1; i <= c_period; i++) {
        let t_i = i * c.line;
        if ((t_i - c.offset) % zero.line === 0) {
          if (cz_steps) throw new Error(`Multiple t_i`);
          // console.log(`CTS ${t_i} (n = ${i})`);
          cz_steps = (t_i - c.offset) / zero.line;
          c_steps = i;
          c_timestamp = t_i;
          cz_timestamp = t_i - c.offset;
        }
      }

      console.log(`Constraint (${_ns(c.line)} off.${c.offset}) -> ti=${_ns(c_timestamp)}, tzi=${_ns(cz_timestamp)} (n=${_ns(c_steps)}/${_ne(c_period)}, n'=${_ns(cz_steps)}/${_ne(z_period)})`); // prettier-ignore

      return {
        constraint: c,
        z_period: z_period,
        z_steps: cz_steps,
        z_timestamp: cz_timestamp,
        period: c_period,
        steps: c_steps,
        timestamp: c_timestamp
      };

      // n = lcm(n, diff < 0 ? (n_period - diff) * sync : diff * sync);
    });

  const max = maxBy(periods, (p) => p.z_period)!;

  const mult = lcm(...periods.map((p) => p.z_period));
  const p_mult = lcm(...periods.map((p) => p.z_period - p.z_steps));
  const t_0 = mult * zero.line - p_mult * zero.line;

  console.log(`mult=${mult}, p_mult=${p_mult}, t_0=${t_0}`);

  // let n = 0;
  // let match = false;
  // while (n < 100_000_000_000) {
  //   n++;
  //   match = true;
  //   for (const period of periods) {
  //     if ((zero.line * n + period.constraint.offset) % period.z_period !== 0) {
  //       match = false;
  //       break;
  //     }
  //   }
  //   if (match)
  //     return {
  //       n,
  //       t: n * zero.line
  //     };

  //   if (n % 1_000_000_000 === 0) {
  //     console.log(`1 billion and counting..`);
  //   }
  // }

  // let n = 0;
  // while (true) {
  //   n++;
  //   const t = n * max.line - max.offset;
  //   if (verify(t)) {
  //     return { n, t };
  //   }

  //   if (n % 100_000_000 === 0) {
  //     console.log(`n up to ${n} -> no results found`);
  //   }
  // }
  /*
   t = x1 * n1
   t = x2 * n2 - 1
   t = x3 * n3 - 2
   */
}

// tests.forEach((test, i) => {
//   const result = solve(test.list)!;
//   const expected = parseInt(test.expected, 10);
//   if (result.t !== expected) {
//     console.log(`Test #${i}: Result ${result.t} vs exp.${expected} (FAILURE)`);
//   }
// });

console.log(`Bus timestamp is:`, solve(tests[0].list));
