import { Bag } from './Bag';

type WeightedEdge = {
  bag: Bag;
  count: number;
};

export class BagGraph {
  /**
   * Contain1 ---\
   *             Contained
   * Contain2 ---/
   */
  public ingoing: Map<Bag, Bag[]> = new Map();

  /**
   *              / Contained1
   * Contain ----
   *              \ Contained2
   */
  public outgoing: Map<Bag, WeightedEdge[]> = new Map();

  public nodesMap: Map<string, Bag> = new Map();

  constructor(private nodes: Set<Bag> = new Set()) {
    nodes.forEach((node) => this.nodesMap.set(node.color, node));
    nodes.forEach((node) => this.add(node));
  }

  add(bag: Bag) {
    if (!this.outgoing.has(bag)) this.outgoing.set(bag, []);
    const outgoingNodes = this.outgoing.get(bag)!;

    for (const outgoing of Object.keys(bag.content)) {
      const child = this.nodesMap.get(outgoing);
      if (!child) throw new Error(`Missing node "${outgoing}"`);

      if (!this.ingoing.has(child)) this.ingoing.set(child, []);
      this.ingoing.get(child)!.push(bag);

      outgoingNodes.push({ bag: child, count: bag.content[outgoing] });
    }
  }

  traverseUp(color: string) {
    const node = this.nodesMap.get(color)!;
    const ingoing = this.ingoing.get(node) ?? [];
    let found: Bag[] = [];

    while (ingoing.length > 0) {
      const parent = ingoing.shift()!;
      if (found.includes(parent)) continue;

      found.push(parent);

      const ancestors = this.ingoing.get(parent) ?? [];
      for (const ancestor of ancestors) {
        if (!found.includes(ancestor)) ingoing.push(ancestor);
      }
    }

    return found;
  }

  traverse(color: string) {
    const root = this.nodesMap.get(color)!;
    let queue: WeightedEdge[] = [{ bag: root, count: 1 }];
    let count = 0;

    while (queue.length > 0) {
      const edge = queue.shift()!;
      const outgoing = this.outgoing.get(edge.bag) ?? [];

      for (let child of outgoing) {
        const childCount = child.count * edge.count;
        count += childCount;
        queue.push({ bag: child.bag, count: childCount });
      }
    }

    return count;
  }
}
