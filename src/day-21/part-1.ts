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
function findHealthy(data: string) {
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

  // distinguo sani da non sani
  const unhealthy = [] as string[];
  for (const [_, allergenIngredients] of allergens) {
    unhealthy.push(...allergenIngredients);
  }

  const healthy = difference(Array.from(ingredients.keys()), unhealthy);

  // count
  let count = 0;
  for (const food of foods) {
    for (const healthyIngredient of healthy) {
      if (food.ingredients.some((i) => i === healthyIngredient)) count++;
    }
  }

  return count;
}

console.log(`Healthy are: `, findHealthy(input));
