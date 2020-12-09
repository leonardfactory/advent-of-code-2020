export function findBug(raw: string | number[], length: number) {
  const stream =
    typeof raw === 'string' ? raw.split('\n').map((n) => parseInt(n, 10)) : raw;
  let preamble = stream.slice(0, length);

  for (let i = length; i < stream.length; i++) {
    const factors = findFactors(preamble, stream[i]);
    if (!factors) return stream[i];

    preamble.shift();
    preamble.push(stream[i]);
  }

  return `<Not Found>`;
}

export function findFactors(preamble: number[], value: number) {
  for (let i = 0; i < preamble.length; i++) {
    if (preamble[i] > value) continue;

    for (let j = 0; j < preamble.length; j++) {
      if (j == i || preamble[j] + preamble[i] !== value) continue;
      return [preamble[i], preamble[j]] as [number, number];
    }
  }
  return null;
}
