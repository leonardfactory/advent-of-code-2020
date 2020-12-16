import fs from 'fs';
import { sum } from 'lodash';
import chalk from 'chalk';

/**
 * L'implementazione di oggi è molto complessa, a partire dal parsing.
 * Per la soluzione usare un CSP con ordinamento delle variabili max(options)
 * è eccessivo, si poteva semplicemente loopare (i,j) con O(n^2) sui fields per
 * ottenere il primo che poteva andare in _un unico_ posto, a questo punto
 * filtrare il secondo e così via, dato che la permutazione è una sola avrebbe
 * funzionato (caso speciale di CSP con |Dsolutions| = 1)
 */

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input.test2.txt', 'utf-8');

type Problem = ReturnType<typeof parse>;
type Fields = Problem['fields'];
type Ticket = number[];

const _p = (n: number) => n.toString().padStart(4, ' ');

// Parsing degli input
function parse(data: string) {
  const [r_fields, r_own, r_tickets] = data.split('\n\n');
  return {
    // Campi del biglietto
    fields: r_fields.split('\n').map((field, i) => {
      const [name, rule] = field.split(':');
      return {
        name,
        i,
        rule: createRule(rule)
      };
    }),
    // Proprio ticket
    own: createTicket(r_own.split('\n')[1]),
    // Altri ticket
    tickets: r_tickets.split('\n').slice(1).map(createTicket)
  };
}

/**
 * Parsing di un ticket
 */
function createTicket(raw: string) {
  return raw.split(',').map((n) => parseInt(n, 10));
}

/**
 * Traduce una regola del tipo `12-24 or 28-39` in un Set con tutti i valori
 * ammessi. Costa in spazio, ma è O(1)
 */
function createRule(raw: string) {
  const rule = new Set<number>();
  const ranges = raw.split('or').map((r) =>
    r
      .trim()
      .split('-')
      .map((n) => parseInt(n, 10))
  );

  for (const range of ranges) {
    const [from, to] = range;
    for (let i = from; i <= to; i++) rule.add(i);
  }

  // console.log(`Rule: ${raw} ->`, Array.from(rule.values()));
  return rule;
}

/**
 * Ottiene i ticket validi
 */
function validTickets(problem: Problem) {
  const { fields, tickets: invalids } = problem;
  let tickets: number[][] = [problem.own];

  const invalidFields = (ticket: number[]) =>
    ticket.filter((v, i) => !fields.some((f) => f.rule.has(v)));

  for (const ticket of invalids) {
    if (invalidFields(ticket).length === 0) tickets.push(ticket);
  }

  return tickets;
}

/**
 * Provo a trovare il set che funziona (idx -> field).
 */
function findAssignmentPermutations(fields: Fields, tickets: Ticket[]) {
  // Per farlo, trovo prima ogni campo a quale elemento potrebbe appartenere.
  let matches = new Map<number, number[]>(); // field -> pos. ticket[]

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];

    for (let j = 0; j < tickets[0].length; j++) {
      let match = true;

      for (const ticket of tickets) {
        if (!field.rule.has(ticket[j])) {
          match = false;
          break;
        }
      }

      if (match) {
        if (!matches.has(i)) matches.set(i, []);
        matches.get(i)!.push(j);
      }
    }
  }

  console.log(`Fields:\n${fields.map((f, i) => `${f.name} = ${i}`).join('\n')}`); // prettier-ignore

  console.log(`Possibilità:`); // prettier-ignore
  for (let [i, js] of matches) {
    console.log(`${chalk.green(`(${_p(i)}) -> `)}[${js.map(j => chalk.cyan(_p(j))).join(',')}]`); // prettier-ignore
  }

  // Calcolo le permutazioni
  const solutions = [] as Map<number, number>[];
  const current = new Map<number, number>(); // empty assignments

  const remaining = Array.from(matches.keys()).sort(
    (a, b) => matches.get(a)!.length - matches.get(b)!.length
  );

  solve(matches, remaining, current, solutions);
  return solutions;
}

/**
 * Ottengo le soluzioni del CSP con backtracking e variabili ordinate secondo
 * max(options)
 */
function solve(
  matches: Map<number, number[]>,
  remaining: number[],
  current: Map<number, number>,
  solutions: Map<number, number>[]
) {
  if (remaining.length === 0) {
    solutions.push(current);
    return;
  }

  const [next, ...nextRemaining] = remaining;
  const used = new Set(current.values());
  const values = matches.get(next)!.filter((o) => !used.has(o));
  if (values.length === 0) {
    // console.log(`DMZ at ${next} (remaining: ${nextRemaining.join(',')})`);
    return; // DMZ
  }

  for (const value of values) {
    const nextCurrent = new Map(current);
    nextCurrent.set(next, value);
    solve(matches, nextRemaining, nextCurrent, solutions);
  }
}

/**
 * Trova la combinazione magica.
 */
function departureMagic(data: string) {
  const problem = parse(data);

  // Ottengo i ticket validi
  const tickets = validTickets(problem);
  console.log(`valids:\n${tickets.map((t) => t.map(n => n.toString().padStart(4, ' ')).join(',')).join('\n')}`); // prettier-ignore

  // Calcolo le permutazioni
  const permutations = findAssignmentPermutations(problem.fields, tickets);
  console.log(`Permutazioni:\n`, permutations);

  const optimal = permutations[0]; // puzzle magic!

  // Campi di interesse
  const departure = problem.fields.filter(f => f.name.startsWith('departure')); // prettier-ignore
  console.log(`Departure fields (${departure.length}):`, departure.map(f => f.name)); // prettier-ignore

  const values = departure.map((f) => {
    const j = optimal.get(f.i)!;
    return problem.own[j];
  });
  console.log(`Values:`, values);
  return values.reduce((mul, v) => mul * v, 1);
}

console.log(`Magic multiplication from classes is: ${departureMagic(input)}`);
