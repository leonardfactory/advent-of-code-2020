import fs from 'fs';
import { difference, flatten, pick } from 'lodash';

let input = fs.readFileSync(__dirname + '/input.txt', 'utf-8');
let test = fs.readFileSync(__dirname + '/test.txt', 'utf-8');

function parse(data: string) {
  return data.split('\n').map((raw) => {
    const raws = raw.split(' (contains ');
    return {
      ingredients: raws[0].split(' ').map((r) => r.trim()),
      allergens: raws[1]
        .replace(')', '')
        .split(',')
        .map((r) => r.trim())
    };
  });
}

// Trova gli ingredienti con gli allergeni
function canonicalDangerousIngredients(data: string) {
  const foods = parse(data);

  // Setup
  let allergens = new Map<string, Set<string>>();
  let ingredients = new Map<string, Set<string>>();
  for (const food of foods) {
    food.ingredients.forEach((i) => ingredients.set(i, new Set()));
  }

  for (const food of foods) {
    let touched = new Set<string>();

    for (const allergen of food.allergens) {
      // Mai censito, lo registriamo
      if (!allergens.has(allergen)) {
        allergens.set(allergen, new Set(food.ingredients));
        continue;
      }

      let previous = allergens.get(allergen)!;

      for (const ingredient of previous) {
        touched.add(ingredient);
        if (!food.ingredients.includes(ingredient)) {
          previous.delete(ingredient);
        }
      }
    }
  }

  console.log('Allergens', allergens);

  const head = (set: Set<string>) => Array.from(set)[0];

  // identifico gli allergeni con i loro ingredienti
  let solving = true;
  let assigned = new Map<string, string>(); // all -> ing
  while (solving) {
    solving = false;
    for (let [allergen, ingredients] of allergens) {
      if (assigned.has(allergen)) continue;

      // unico possibile, lo assegno e lo rimuovo dagli altri
      if (ingredients.size === 1) {
        let picked = head(ingredients);
        assigned.set(allergen, picked);

        for (let [otherAllergen, otherIngredients] of allergens) {
          if (otherAllergen === allergen) continue;
          if (otherIngredients.has(picked)) {
            otherIngredients.delete(picked);
          }
        }

        solving = true;
      }
    }
  }

  // ordino
  const sortedAllergens = Array.from(assigned.entries()).sort(
    ([a1, i1], [a2, i2]) => {
      return a1.localeCompare(a2);
    }
  );

  return sortedAllergens.map(([allergen, ingredient]) => ingredient).join(',');
}

console.log(
  `Canonical dangerous ingredient list:\n`,
  canonicalDangerousIngredients(input)
);
