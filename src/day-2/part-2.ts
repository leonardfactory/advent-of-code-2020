import fs from 'fs';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input-test.txt', 'utf-8');

function parse(data: string) {
  const lines = data.split('\n');
  return lines.map(parseRow);
}

const REGEX = /^(\d+)\-(\d+) (\w): (\w+)$/;

function parseRow(row: string) {
  const parsed = row.match(REGEX);
  if (!parsed) throw new Error(`Row "${row}" is not valid`);
  const [_, index1, index2, char, password] = parsed;

  return {
    index1: parseInt(index1, 10),
    index2: parseInt(index2, 10),
    char,
    password
  };
}

type Row = ReturnType<typeof parseRow>;

function check(rows: Row[]) {
  console.log(`Rows ex.`, rows[0]);
  return rows.filter((row) => isValid(row)).length;
}

function isValid(row: Row) {
  const char1 = row.password.charAt(row.index1 - 1) === row.char ? 1 : 0;
  const char2 = row.password.charAt(row.index2 - 1) === row.char ? 1 : 0;

  // console.log(`Row`, row, ` isValid? ${char1 ^ char2}`);
  return char1 ^ char2;
}

console.log(`Checked: ${check(parse(input))}`);
