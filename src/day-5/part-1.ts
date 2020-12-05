import fs from 'fs';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input-test.txt', 'utf-8');

const parseAll = (data: string) => data.split('\n').map(parse);
function parse(raw: string) {
  const rawRow = raw.split('');
  const rawCol = rawRow.splice(7);

  const [row, col] = [toValue(rawRow), toValue(rawCol)];
  // console.log(` Raw: ${rawRow} - ${rawCol}`);
  return {
    row,
    col,
    id: seatId(row, col),
    raw
  };
}

function toValue(raw: string[]) {
  let value = 0;
  for (let i = 0; i < raw.length; i++) {
    const exp = raw.length - i - 1;
    const binary = raw[i] === 'F' || raw[i] === 'L' ? 0 : 1;
    // console.log(`  ${raw[i]} value ${value} -> ${value + binary * (2 ** exp)} (bin ${binary}, exp ${exp})`); // prettier-ignore
    value += binary * 2 ** exp;
  }
  return value;
}

function seatId(row: number, col: number) {
  return row * 8 + col;
}

function maxId(data: string) {
  const passes = parseAll(data);
  let max = -1;
  for (const pass of passes) {
    console.log(`Pass ${pass.raw}: (Row ${pass.row}, Col ${pass.col}) ${pass.id}`); // prettier-ignore
    if (pass.id > max) max = pass.id;
  }
  return max;
}

console.log(`Max pass ID: ${maxId(input)}`);
