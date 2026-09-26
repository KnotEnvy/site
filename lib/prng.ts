/**
 * Deterministic pseudo-random numbers that are IDENTICAL on the server and in
 * the browser.
 *
 * The classic shader-style `fract(sin(n * 127.1) * 43758.5453)` hash is fine
 * inside WebGL or anything client-only, but it must never feed markup that is
 * server-rendered: the huge multiplier amplifies last-bit differences in
 * `Math.sin` between JS engines, so Node and Chrome print different numbers
 * into the same SVG attribute and React reports a hydration mismatch (seen on
 * the fine-tuning illustration). Integer math via Math.imul is exact everywhere.
 */
export function hash01(n: number): number {
  let h = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** hash01 for non-integer seeds (e.g. i + 3.3): scaled to an integer first. */
export function hashf(x: number): number {
  return hash01(Math.round(x * 1000));
}
