export type BagContent = {
  [color: string]: number;
};

const DESC = /^\s*(\d+) ([\w\s]+) bag|bags\s*$/;

export class Bag {
  constructor(public color: string, public content: BagContent) {}

  static parse(data: string) {
    const [description, contents] = data.trim().split(' contain ');
    return new Bag(
      description.replace(' bags', ''),
      contents === 'no other bags.'
        ? {}
        : contents
            .replace('.', '')
            .split(',')
            .reduce((obj, desc) => {
              const [_, count, color] = desc.match(DESC) ?? [];
              obj[color] = parseInt(count, 10);
              return obj;
            }, {} as BagContent)
    );
  }
}
