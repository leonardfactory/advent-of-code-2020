import fs from 'fs';
import { Passport } from './Passport';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/input-test2.txt', 'utf-8');

function read(data: string) {
  const raws = data.split('\n\n');
  return raws.map(Passport.parse);
}

const YEAR_MATCH = /^\d{4}$/;
const HEIGHT_MATCH = /^(\d+)(in|cm)$/;
const COLOR_MATCH = /^#([0-9a-f]{6})$/;
const ID_MATCH = /^([0-9]{9})$/;
const EYE_COLORS = ['amb', 'blu', 'brn', 'gry', 'grn', 'hzl', 'oth'];

function createValidator() {
  const validHeight = (height: string) => {
    const [_, value, unit] = height.match(HEIGHT_MATCH) ?? [];
    if (!value || !unit) {
      // throw new Error('invalid units');
      return false;
    }
    if (
      unit === 'cm' &&
      parseInt(value, 10) >= 150 &&
      parseInt(value, 10) <= 193
    )
      return true;
    if (unit === 'in' && parseInt(value, 10) >= 59 && parseInt(value, 10) <= 76)
      return true;

    return false;
  };

  function tap(message: string) {
    // console.log(message);
    return true;
  }

  return function isValid(passport: Passport) {
    const items = passport.items;

    return (
      items.byr != null &&
      items.byr.match(YEAR_MATCH) &&
      parseInt(items.byr, 10) >= 1920 &&
      parseInt(items.byr, 10) <= 2002 &&
      tap('byr') &&
      items.iyr != null &&
      items.iyr.match(YEAR_MATCH) &&
      parseInt(items.iyr, 10) >= 2010 &&
      parseInt(items.iyr, 10) <= 2020 &&
      tap('iyr') &&
      items.eyr != null &&
      items.eyr.match(YEAR_MATCH) &&
      parseInt(items.eyr, 10) >= 2020 &&
      parseInt(items.eyr, 10) <= 2030 &&
      tap('eyr') &&
      items.hgt != null &&
      validHeight(items.hgt) &&
      items.ecl != null &&
      EYE_COLORS.includes(items.ecl) &&
      tap('hgt') &&
      items.hcl != null &&
      items.hcl.match(COLOR_MATCH) &&
      tap('hcl') &&
      items.pid != null &&
      items.pid.match(ID_MATCH) &&
      tap('pid')
    );
  };
}

function validate(data: string) {
  const passports = read(data);
  const validator = createValidator();

  const valids = passports.filter((p, i) => {
    const isValid = validator(p);
    console.log(`Passport #${i + 1} ${isValid ? 'VALID' : 'NOT VALID'}.`);
    return isValid;
  });
  return valids.length;
}

console.log(`Valid passports: ${validate(input)}`);
