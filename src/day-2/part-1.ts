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
  const [_, min, max, char, password] = parsed;

  return {
    min: parseInt(min, 10),
    max: parseInt(max, 10),
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
  const occurences = row.password.split('').filter((c) => c === row.char)
    .length;

  return occurences >= row.min && occurences <= row.max;
}

console.log(`Checked: ${check(parse(input))}`);
