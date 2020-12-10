import fs from 'fs';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input-test.txt', 'utf-8');
let test2 = fs.readFileSync(__dirname + '/input-test2.txt', 'utf-8');

class Graph {
  edges: Map<number, number[]> = new Map();
  inverse: Map<number, number[]> = new Map();
  constructor(nodes: number[]) {}

  add(from: number, to: number) {
    if (!this.edges.has(from)) this.edges.set(from, []);
    this.edges.get(from)!.push(to);

    if (!this.inverse.has(to)) this.inverse.set(to, []);
    this.inverse.get(to)!.push(from);
  }

  count(root: number, leaf: number) {
    // Dynamic-programming: mantengo il numero delle soluzioni parziali, a partire dalle foglie (bottom-up)
    let solutions: Map<number, number> = new Map();

    let nodes: number[] = [leaf];
    while (nodes.length > 0) {
      const node = nodes.shift()!;
      const parents = this.inverse.get(node) ?? [];

      for (const parent of parents) {
        // BFS
        if (!solutions.has(parent)) nodes.push(parent);
        solutions.set(
          parent,
          (solutions.get(parent) ?? 0) +
            (node === leaf ? 1 : solutions.get(node) ?? 0)
        );
      }
    }

    return solutions.get(root);
  }
}

function combinations(data: string) {
  const adapters = data
    .split('\n')
    .map((n) => parseInt(n, 10))
    .sort((a, b) => a - b);

  // Adattatore
  adapters.unshift(0);

  // Grafo delle permutazioni
  const graph = new Graph(adapters);

  for (let i = 1; i < adapters.length; i++) {
    for (let j = i - 1; j >= 0; j--) {
      if (adapters[i] - adapters[j] > 3) break;
      graph.add(adapters[j], adapters[i]);
    }
  }

  // Calcolo permutazioni
  const permutations = graph.count(0, adapters[adapters.length - 1]);
  return permutations;
}

console.log(`Combinations:`, combinations(input));
