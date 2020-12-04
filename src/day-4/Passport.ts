import { fromPairs, intersection, omit, without } from 'lodash';

const PassportField = {
  byr: 'Birth Year',
  iyr: 'Issue Year',
  eyr: 'Expiration Year',
  hgt: 'Height',
  hcl: 'Hair Color',
  ecl: 'Eye Color',
  pid: 'Passport ID',
  cid: 'Country ID'
};

type PassportField = keyof typeof PassportField;

const RequiredPassportFieldKeys = without(
  Object.keys(PassportField) as PassportField[],
  'cid'
);

type PassportItems = {
  [K in keyof typeof PassportField]?: string;
};

export class Passport {
  constructor(public items: PassportItems) {}

  static parse(data: string) {
    const raw = fromPairs(
      data
        .trim()
        .split(/\s+/)
        .map((item) => {
          return item.split(':');
        })
    );
    // console.log(`Raw passport: `, raw);
    return new Passport(raw);
  }

  isValid() {
    return RequiredPassportFieldKeys.every((key) => this.items[key] != null);
  }
}
