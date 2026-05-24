// Simple seeded pseudo-random so book heights are stable across renders
export function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash % 1000) / 1000;
}

export function randomBookHeight(seed: string): number {
  const r = seededRandom(seed);
  return Math.round(55 + r * 20); // 55-75px
}
