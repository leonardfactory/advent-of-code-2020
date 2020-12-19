import fs from 'fs';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input.test.txt', 'utf-8');

// Debug
const DEBUG = true;
const debug = (...args: Parameters<typeof console.log>) =>
  DEBUG && console.log(...args);

// Tipo
type Rule = {
  node: number;
  edges: number[][] | string;
};

type Edge = number[] | string;

// Grafo per la FSM
class Graph {
  rules: Rule[];
  map: Map<number, Rule> = new Map();

  constructor(raw: string) {
    // parse delle regole
    this.rules = raw.split('\n').map((r) => {
      const matches = r.split(':');
      const node = parseInt(matches[0], 10);

      if (matches[1].includes('"')) {
        return {
          node,
          edges: matches[1].trim().replace('"', '').replace('"', '')
        };
      }

      const edges = matches[1].split('|').map(
        (e) =>
          e
            .trim()
            .split(' ')
            .map((em) => parseInt(em, 10)) as number[]
      );
      return { node, edges };
    });

    for (const rule of this.rules) {
      this.map.set(rule.node, rule);
    }
  }

  match(message: string, i: number = 0, rule: Rule = this.map.get(0)!) {
    if (rule.node === 0) debug(`[message="${message}"]`);
    debug(`(i=${i}) Regola ${rule.node} `);
    if (typeof rule.edges === 'string') {
      debug(` - Regola ${rule.node} -> term "${rule.edges}" (match=${message[i] === rule.edges}, i=${i})`); // prettier-ignore
      return [message[i] === rule.edges, i + 1] as const;
    }

    for (const edge of rule.edges) {
      debug(` - (i=${i}) Regola ${rule.node} -> edge ${edge.join(' ')}`);
      let match = false;
      let i_n = i;

      for (let j = 0; j < edge.length; j++) {
        const rule_n = this.map.get(edge[j])!;
        [match, i_n] = this.match(message, i_n, rule_n)!;
        debug(`   - (i=${i}) ${edge[j]} (${j+1}/${edge.length}) ${rule_n.node} -> match=${match}, i_n=${i_n}`); // prettier-ignore
        if (!match) break;
      }

      if (match) {
        debug(` - (i=${i}) Regola ${rule.node} -> edge ${edge.join(' ')} OK! (${i_n})`); // prettier-ignore
        return [true, i_n] as const;
      }
    }

    return [false, i + 1] as const;
  }
}

function count(data: string) {
  const raws = data.split('\n\n');
  const graph = new Graph(raws[0]);
  const messages = raws[1].split('\n');

  let count = 0;
  for (const message of messages) {
    const [match, i_n] = graph.match(message);
    const valid = match && i_n == message.length;

    if (valid) count++;
    console.log(`${message} -> ${valid ? 'Y' : 'N'}\n`);
  }

  return count;
}

console.log(`Count is: ${count(input)}`);
