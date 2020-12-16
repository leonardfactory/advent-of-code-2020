import fs from 'fs';
import { sum } from 'lodash';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input.test.txt', 'utf-8');

// Parsing degli input
function parse(data: string) {
  const [r_fields, r_own, r_tickets] = data.split('\n\n');
  return {
    // Campi del biglietto
    fields: r_fields.split('\n').map((field) => {
      const [name, rule] = field.split(':');
      return {
        name,
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
 * Trova gli invalidi
 */
function invalids(data: string) {
  const { fields, own, tickets } = parse(data);

  let valids: number[][] = [];

  const invalidFields = (ticket: number[]) =>
    ticket.filter((v, i) => !fields.some((f) => f.rule.has(v)));

  for (const ticket of tickets) {
    if (invalidFields(ticket))
  }

  console.log(`Invalids`, allInvalids);
  return sum(allInvalids);
}

console.log(`Ticket scanning error rate: ${invalids(input)}`);
