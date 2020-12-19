import fs from 'fs';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input.test2.txt', 'utf-8');

// Debug
const DEBUG = false;
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
    raw = raw
      .replace('8: 42', '8: 42 | 42 8')
      .replace('11: 42 31', '11: 42 31 | 42 11 31');

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
    if (i >= message.length) return [false, [i]] as const;

    if (rule.node === 0) debug(`[message="${message}"]`);
    debug(`(i=${i}) Regola ${rule.node} `);
    if (typeof rule.edges === 'string') {
      debug(` - Regola ${rule.node} -> term "${rule.edges}" (match=${message[i] === rule.edges}, i=${i})`); // prettier-ignore
      return [message[i] === rule.edges, [i + 1]] as const;
    }

    // tutte le `i` valide a cui può continuare, per qualsiasi edge
    let is = [] as number[];

    for (const edge of rule.edges) {
      debug(` - (i=${i}) Regola ${rule.node} -> edge ${edge.join(' ')}`);
      let match = false;
      let i_ns = [i];

      for (let j = 0; j < edge.length; j++) {
        const rule_n = this.map.get(edge[j])!;
        let i_nexts = [] as number[];

        for (const i_n of i_ns) {
          let [match_n, i_next] = this.match(message, i_n, rule_n)!;
          debug(`   - (i=${i}) ${edge[j]} (${j+1}/${edge.length}) ${rule_n.node} -> match=${match_n}, i_n=${i_n}, i_next=${i_next.join(', ')}`); // prettier-ignore
          match ||= match_n;
          if (match_n) {
            i_nexts.push(...i_next);
          }
        }

        if (!match) break;
        i_ns = i_nexts;
      }

      if (match) {
        is.push(...i_ns);
        debug(` - (i=${i}) Regola ${rule.node} -> edge ${edge.join(' ')} OK! (i_ns=${i_ns.join(', ')})`); // prettier-ignore
      }
    }

    if (is.length > 0) return [true, is] as const;

    return [false, [i + 1]] as const;
  }
}

function count(data: string) {
  const raws = data.split('\n\n');
  const graph = new Graph(raws[0]);
  let messages = raws[1].split('\n');

  // messages = [messages[2]];

  let count = 0;
  for (const message of messages) {
    const [match, i_ns] = graph.match(message);
    const valid = match && i_ns.some((i_n) => i_n === message.length);

    if (valid) count++;
    console.log(`${message} -> ${valid ? 'Y' : 'N'}\n`);
  }

  return count;
}

console.log(`Count is: ${count(input)}`);
