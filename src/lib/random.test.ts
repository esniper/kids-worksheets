import { describe, expect, it } from "vitest";
import { mulberry32, shuffle } from "./random";

describe("mulberry32", () => {
  it("produces a deterministic sequence in [0, 1) for a given seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const v = a();
      expect(v).toBe(b());
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("produces different sequences for different seeds", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });
});

describe("shuffle", () => {
  const items = Array.from({ length: 50 }, (_, i) => i);

  it("returns a permutation of the input", () => {
    const out = shuffle(items, 7);
    expect([...out].sort((a, b) => a - b)).toEqual(items);
  });

  it("is deterministic for the same seed", () => {
    expect(shuffle(items, 7)).toEqual(shuffle(items, 7));
  });

  it("differs across seeds", () => {
    expect(shuffle(items, 1)).not.toEqual(shuffle(items, 2));
  });

  it("does not mutate the input", () => {
    const copy = [...items];
    shuffle(items, 3);
    expect(items).toEqual(copy);
  });
});
