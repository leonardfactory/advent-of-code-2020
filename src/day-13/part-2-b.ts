import fs from 'fs';

let input = fs.readFileSync(__dirname + '/input2.txt', 'utf-8');
let tests = parseTests(
  fs.readFileSync(__dirname + '/input2.test.txt', 'utf-8')
);

function parse(raw: string) {
  return raw
    .split(',')
    .map((line, i) => ({ line, offset: i }))
    .filter((line) => line.line !== 'x')
    .map((line) => ({ ...line, line: parseInt(line.line, 10) }));
}

function parseTests(raw: string) {
  return raw
    .split('\n')
    .map((row) => row.split(':') as [string, string])
    .map(([list, expected]) => ({ list, expected }));
}

/**
 * Massimo comun denominatore (G.C.D.)
 */
function gcd(a: number, b: number) {
  a = Math.abs(a);
  b = Math.abs(b);
  if (b > a) [a, b] = [b, a];
  while (true) {
    if (b == 0) return a;
    a %= b;
    if (a == 0) return b;
    b %= a;
  }
}

/**
 * Dato un numero primo `mod`, trova l'inverso della moltiplicazione
 * nell'anello `Zmod`, ovvero n' tale che:
 *  n' * n = 1
 */
const invmod = (n: number, mod: number) => {
  n %= mod;
  for (let i = 1; i <= mod; i++) {
    if ((i * n) % mod === 1) return i;
  }
  throw new Error('notfoundinv');
};

/**
 * Risoluzione tramite il metodo del Modulo dell'equazione Diofantea:
 *  ax + by = c
 *
 * Ritorna (x0, u) tali che:
 *  x = x0 + u * k
 *
 * con k € N
 */
function diophantine(a: number, b: number, c: number) {
  const div = gcd(a, b);
  if (c % div !== 0) throw new Error('unsolvable.integer');

  // Riduco, se riducibile
  if (div !== 1) {
    a /= div;
    b /= div;
    c /= div;
  }

  console.log(`Dioph: ${a} * x + ${b} * y = ${c}`);

  // Utilizzo il modulo per ottenere le soluzioni
  // ax + bx = c =>
  // ax -c = -bx
  // ax = c mod b'
  const b_abs = Math.abs(b);
  // a' = invmod (a, b)  t.c.  (a' * a) mod b = 1
  const a_inv = invmod(a, b_abs);

  // a' a x = a' c mod b
  // x = a' c mod b
  const x0 = (a_inv * c) % b_abs;
  const u = b_abs;

  return [x0, u];
}

/**
 * Ho trovato in giro alcune soluzioni con il teorema cinese dei resti.
 * Di seguito la mia soluzione con le equazioni diofantine.
 *
 * L'idea di fondo per risolvere il problema, è che la concomitaziona dei `bus`
 * corrisponda a un sistema di equazioni diofantine (ovvero del tipo
 * ax + by = c, dove interessano le soluzioni) intere.
 *
 * Per risolvere il sistema, provvediamo a costruire la prima equazione
 * come segue, la quale indica che dopo `n` passi (del primo bus) e `n1` passi
 * (del secondo bus) si devono "incontrare" a `off1` minuti di distanza:
 *
 *  z0 * n - z1 * n1 = - off1  (1)
 *
 * Dove:
 * - z0 è il primo numero primo (quello con offset = 0)
 * - n (x) è la nostra soluzione, sul periodo z0
 * - z1 è il secondo numero primo
 * - off1 è l'offset del secondo numero primo (i.e. 1)
 *
 * A questo punto, una volta risolta avremo una soluzione del tipo:
 *
 *  n = n0 + u * k     ovvero      x = x0 + u * k   (2)
 *
 * Passiamo a verificare la i-esima (successiva) equazione (o vincolo)
 * dell'input, dove sappiamo che:
 *
 *  z0 * n - z2 * n2 = - off2  (3)
 *
 * Ovvero la (1), ma per rispettare il vincolo di distanza in minuti fra il
 * primo timestamp e il _terzo_ bus. (i.e. off2 = 4, z2 = 59).
 *
 * Al posto di risolverla direttamente, sostituiamo `n` con la soluzione
 * precedente (2) e abbiamo dunque:
 *
 *  z0 * (n0 + u + k) - z2 * n2 = - off2    (4a)
 *
 * Che sviluppata equivale a:
 *
 *  (z0 * u) * k - z2 * n2 = -off2 - z0 * x0 (4b)
 *
 * Dove possiamo definire, per sostituzione:
 * - a' = z0 * u
 * - b' = z2
 * - c' = -off2 - z0 * x0
 *
 * Ottenendo quindi un'altra equazione diofantinea:
 *
 *  a' k - b' n2 = c' (5)
 *
 * Provvedendo a risolvere la (5) otteniamo una nuova soluzione, questa volta
 * per ottenere k:
 *
 *  k = x0' + u' k'
 *
 * Possiamo quindi sostituire nella (2) e otteniamo, questa volta rispetto a x:
 *
 *  x = x0 + u (x0' + u' k') =
 *  x = x0 + u x0' + u u' k'
 *
 * A questo punto (principio iterativo), assegniamo:
 *  x0 = x0 + u x0'
 *  u  = u u'
 *
 * E procediamo all'iterazione successiva, fino a quando avremo in `x0` il
 * timestamp desiderato.
 */
function solve(data: string) {
  const constraints = parse(data);

  const zero = constraints[0];
  console.log(`Zero: ${zero.line} (off.${zero.offset} = 0)`);

  // Nella prima iterazione, ax è uguale a a(x0 + uk) se x0 = 0, u = 1
  let x0 = 0;
  let u = 1;

  const equations = constraints.filter((c) => c.offset >= 1);
  for (const equation of equations) {
    // Inizializzo le variabili dell'equazione diofantina `ax + by = c`
    let a = zero.line * u;
    let b = -equation.line;
    let c = -equation.offset - zero.line * x0;

    let [x0_i, u_i] = diophantine(a, b, c);
    console.log(`Constraint (${equation.line} off=${equation.offset}) -> x = ${x0_i} + ${u_i} * k `); // prettier-ignore

    x0 = x0 + u * x0_i;
    u = u * u_i;
    console.log(`x = ${x0} + ${u} * k`);
  }

  // La soluzione potrebbe ancora essere minore di 0 (dato che non vincoliamo
  // le soluzioni positive). Basta semplicemente usare la formula `x = x0 + uk`
  // e incrementare il valore di `k` da 0 a 1.
  const n = x0 + (x0 < 0 ? u * 1 : 0);
  const t = n * zero.line;
  console.log(`Answer is: ${t}`);
  return { n, t };
}

tests.forEach((test, i) => {
  const result = solve(test.list)!;
  const expected = parseInt(test.expected, 10);

  console.log(
    `Test #${i}: Result ${result.t} vs exp.${expected} (${
      result.t === expected ? 'ok' : 'FAILURE'
    })\n\n`
  );
});

console.log(`Bus timestamp is:`, solve(input));
