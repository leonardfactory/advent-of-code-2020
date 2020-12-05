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

function* createSeats() {
  let row = 1;
  let col = 1;
  while (row <= 128 && col <= 8) {
    yield { row: row, col: col++ };
    if (col === 9) {
      row++;
      col = 1;
    }
  }
}

function find(data: string) {
  const passes = parseAll(data);
  console.log(`passes.length ${passes.length}, total expected ${128 * 8}`); // prettier-ignore

  passes.sort((a, b) => a.id - b.id);

  let found;

  const seats = createSeats();
  for (const seat of seats) {
    const currId = seatId(seat.row, seat.col);
    // console.log(`Searching  (Row ${seat.row}, Col ${seat.col}) -> id ${currId}`); // prettier-ignore
    const pass = passes.findIndex((p) => p.id === currId);
    if (pass >= 0) continue;

    console.log(`Missing (Row ${seat.row}, Col ${seat.col})`);

    const next = passes.find((p) => p.id === currId + 1);
    const prev = passes.find((p) => p.id === currId - 1);
    if (next && prev) {
      console.log(`Found our seat: ${seat.row}, ${seat.col} (${currId})`);
      found = seat;
    }
  }

  return found;
}

const foundSeat = find(input);
console.log(`Found seat: `, foundSeat, seatId(foundSeat!.row, foundSeat!.col));
