import { fromPairs, intersection, merge } from 'lodash';

type AnswersMap = {
  [key: string]: number;
};

export class Custom {
  map: AnswersMap;

  constructor(public answers: string[]) {
    this.map = fromPairs(answers.map((a) => [a, 1]));
  }

  static parse(raw: string) {
    return new Custom(raw.split(''));
  }
}

export class CustomGroup {
  map: AnswersMap;
  agrees: string[];

  constructor(public customs: Custom[]) {
    this.map = merge({}, ...customs.map((c) => c.map));
    this.agrees = intersection(...customs.map((c) => c.answers));
  }

  static parseAll(data: string) {
    return data.split('\n\n').map(CustomGroup.parse);
  }

  static parse(raw: string) {
    return new CustomGroup(raw.split('\n').map(Custom.parse));
  }
}
