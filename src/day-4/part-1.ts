import fs from 'fs';
import { Passport } from './Passport';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input-test.txt', 'utf-8');

function read(data: string) {
  const raws = data.split('\n\n');
  return raws.map(Passport.parse);
}

function validate(data: string) {
  const passports = read(data);
  const valids = passports.filter((p, i) => {
    const isValid = p.isValid();
    if (isValid) console.log(`Passport #${i} is valid.`);
    return isValid;
  });
  return valids.length;
}

console.log(`Valid passports: ${validate(input)}`);
