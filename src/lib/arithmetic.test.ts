import { describe, expect, it } from "vitest";
import {
  DRILL_COUNT,
  answerFor,
  buildBigNumbers,
  buildDrill,
  buildMixedBig,
  buildMixedDrill,
  type ArithmeticProblem,
  type CarryMode,
} from "./arithmetic";

// Independent re-implementations of the column arithmetic, so the tests
// don't trust the module's own helpers.
function hasCarry(top: number, bottom: number): boolean {
  let t = top;
  let b = bottom;
  let carry = 0;
  while (t > 0 || b > 0) {
    const s = (t % 10) + (b % 10) + carry;
    if (s > 9) return true;
    carry = 0;
    t = Math.floor(t / 10);
    b = Math.floor(b / 10);
  }
  return false;
}

function hasBorrow(top: number, bottom: number): boolean {
  let t = top;
  let b = bottom;
  let borrow = 0;
  while (b > 0 || borrow > 0) {
    const d = (t % 10) - borrow - (b % 10);
    if (d < 0) return true;
    borrow = 0;
    t = Math.floor(t / 10);
    b = Math.floor(b / 10);
  }
  return false;
}

function digitCount(n: number): number {
  return String(n).length;
}

// Multiplication regroups when any single top-digit × bottom-digit reaches 10.
function hasMulRegroup(top: number, bottom: number): boolean {
  const topDigits = String(top).split("").map(Number);
  const bottomDigits = String(bottom).split("").map(Number);
  return topDigits.some((t) => bottomDigits.some((b) => t * b >= 10));
}

function key(p: ArithmeticProblem): string {
  return `${p.top},${p.bottom}`;
}

describe("buildDrill", () => {
  it("addition: 60 distinct facts with operands 1-9", () => {
    const problems = buildDrill("add", 5);
    expect(problems).toHaveLength(DRILL_COUNT);
    expect(new Set(problems.map(key)).size).toBe(DRILL_COUNT);
    for (const p of problems) {
      expect(p.top).toBeGreaterThanOrEqual(1);
      expect(p.top).toBeLessThanOrEqual(9);
      expect(p.bottom).toBeGreaterThanOrEqual(1);
      expect(p.bottom).toBeLessThanOrEqual(9);
    }
  });

  it("subtraction: 60 distinct facts, minuend to 18, single-digit subtrahend and answer", () => {
    const problems = buildDrill("sub", 5);
    expect(problems).toHaveLength(DRILL_COUNT);
    expect(new Set(problems.map(key)).size).toBe(DRILL_COUNT);
    for (const p of problems) {
      expect(p.top).toBeGreaterThanOrEqual(2);
      expect(p.top).toBeLessThanOrEqual(18);
      expect(p.bottom).toBeGreaterThanOrEqual(1);
      expect(p.bottom).toBeLessThanOrEqual(9);
      const answer = p.top - p.bottom;
      expect(answer).toBeGreaterThanOrEqual(1);
      expect(answer).toBeLessThanOrEqual(9);
    }
  });

  it("is deterministic per seed and varies across seeds", () => {
    expect(buildDrill("add", 9)).toEqual(buildDrill("add", 9));
    expect(buildDrill("add", 9)).not.toEqual(buildDrill("add", 10));
  });
});

describe("buildBigNumbers", () => {
  const digitCombos: Array<[number, number]> = [
    [1, 1],
    [2, 1],
    [2, 2],
    [3, 1],
    [3, 2],
    [3, 3],
  ];
  const carries: CarryMode[] = ["no", "yes", "mix"];

  function build(
    op: "add" | "sub",
    x: number,
    y: number,
    carry: CarryMode,
    seed = 1,
  ) {
    return buildBigNumbers(op, {
      xDigits: x,
      yDigits: y,
      carry,
      count: 30,
      seed,
    });
  }

  it("respects the requested count", () => {
    const problems = buildBigNumbers("add", {
      xDigits: 2,
      yDigits: 2,
      carry: "mix",
      count: 12,
      seed: 3,
    });
    expect(problems).toHaveLength(12);
  });

  it("subtraction operands have the requested digit counts", () => {
    for (const [x, y] of digitCombos) {
      for (const carry of carries) {
        if (carry === "yes" && x === 1 && y === 1) continue;
        for (const p of build("sub", x, y, carry)) {
          expect(digitCount(p.top)).toBe(x);
          expect(digitCount(p.bottom)).toBe(y);
        }
      }
    }
  });

  it("addition operands have the requested digit counts in either order", () => {
    for (const [x, y] of digitCombos) {
      for (const carry of carries) {
        for (const p of build("add", x, y, carry)) {
          expect(
            [digitCount(p.top), digitCount(p.bottom)].sort(),
            `${p.top}+${p.bottom}`,
          ).toEqual([y, x]);
        }
      }
    }
  });

  it("addition treats xDigits and yDigits as interchangeable", () => {
    for (const carry of carries) {
      for (const p of build("add", 1, 3, carry)) {
        expect(
          [digitCount(p.top), digitCount(p.bottom)].sort(),
          `${p.top}+${p.bottom}`,
        ).toEqual([1, 3]);
      }
    }
  });

  it("addition mixes which operand sits on top when digit counts differ", () => {
    const problems = build("add", 3, 1, "mix");
    expect(problems.some((p) => digitCount(p.top) === 3)).toBe(true);
    expect(problems.some((p) => digitCount(p.top) === 1)).toBe(true);
  });

  it("addition never repeats a fact in the opposite orientation", () => {
    // Roomy pool, so best-effort dedupe should always have space to retry.
    for (let seed = 1; seed <= 5; seed++) {
      const unordered = build("add", 3, 2, "mix", seed).map((p) =>
        [p.top, p.bottom].sort((a, b) => a - b).join(","),
      );
      expect(new Set(unordered).size).toBe(unordered.length);
    }
  });

  it("addition with carry='no' never carries", () => {
    for (const [x, y] of digitCombos) {
      for (const p of build("add", x, y, "no")) {
        expect(hasCarry(p.top, p.bottom), `${p.top}+${p.bottom}`).toBe(false);
      }
    }
  });

  it("addition with carry='yes' always carries", () => {
    for (const [x, y] of digitCombos) {
      for (const p of build("add", x, y, "yes")) {
        expect(hasCarry(p.top, p.bottom), `${p.top}+${p.bottom}`).toBe(true);
      }
    }
  });

  it("subtraction never goes negative in any mode", () => {
    for (const [x, y] of digitCombos) {
      for (const carry of carries) {
        if (carry === "yes" && x === 1 && y === 1) continue;
        for (let seed = 1; seed <= 5; seed++) {
          for (const p of build("sub", x, y, carry, seed)) {
            expect(p.top).toBeGreaterThanOrEqual(p.bottom);
          }
        }
      }
    }
  });

  it("subtraction with carry='no' never borrows", () => {
    for (const [x, y] of digitCombos) {
      for (const p of build("sub", x, y, "no")) {
        expect(hasBorrow(p.top, p.bottom), `${p.top}-${p.bottom}`).toBe(false);
      }
    }
  });

  it("subtraction with carry='yes' always borrows", () => {
    for (const [x, y] of digitCombos) {
      if (x === 1 && y === 1) continue;
      for (const p of build("sub", x, y, "yes")) {
        expect(hasBorrow(p.top, p.bottom), `${p.top}-${p.bottom}`).toBe(true);
      }
    }
  });

  it("throws for single-digit subtraction with forced borrowing", () => {
    expect(() => build("sub", 1, 1, "yes")).toThrow();
  });

  it("is deterministic per seed and varies across seeds", () => {
    expect(build("add", 3, 2, "mix", 4)).toEqual(build("add", 3, 2, "mix", 4));
    expect(build("add", 3, 2, "mix", 4)).not.toEqual(
      build("add", 3, 2, "mix", 5),
    );
  });
});

describe("buildBigNumbers multiplication", () => {
  const digitCombos: Array<[number, number]> = [
    [1, 1],
    [2, 1],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 1],
    [4, 3],
    [4, 4],
  ];
  const modes: CarryMode[] = ["no", "yes", "mix"];

  function build(x: number, y: number, regroup: CarryMode, seed = 1) {
    return buildBigNumbers("mul", {
      xDigits: x,
      yDigits: y,
      carry: regroup,
      count: 30,
      seed,
    });
  }

  it("operands have the requested digit counts, top × bottom (no swap)", () => {
    for (const [x, y] of digitCombos) {
      for (const mode of modes) {
        for (const p of build(x, y, mode)) {
          expect(digitCount(p.top), `${p.top}×${p.bottom}`).toBe(x);
          expect(digitCount(p.bottom), `${p.top}×${p.bottom}`).toBe(y);
        }
      }
    }
  });

  it("regroup='no' never regroups", () => {
    for (const [x, y] of digitCombos) {
      for (const p of build(x, y, "no")) {
        expect(hasMulRegroup(p.top, p.bottom), `${p.top}×${p.bottom}`).toBe(
          false,
        );
      }
    }
  });

  it("regroup='yes' always regroups", () => {
    for (const [x, y] of digitCombos) {
      for (const p of build(x, y, "yes")) {
        expect(hasMulRegroup(p.top, p.bottom), `${p.top}×${p.bottom}`).toBe(
          true,
        );
      }
    }
  });

  it("single-digit × single-digit forced regroup does not throw", () => {
    expect(() => build(1, 1, "yes")).not.toThrow();
    for (const p of build(1, 1, "yes")) {
      expect(p.top * p.bottom).toBeGreaterThanOrEqual(10);
    }
  });

  it("is deterministic per seed and varies across seeds", () => {
    expect(build(3, 2, "mix", 4)).toEqual(build(3, 2, "mix", 4));
    expect(build(3, 2, "mix", 4)).not.toEqual(build(3, 2, "mix", 5));
  });
});

describe("answerFor", () => {
  it("computes the result for each operation", () => {
    expect(answerFor("add", { top: 27, bottom: 15 })).toBe(42);
    expect(answerFor("sub", { top: 50, bottom: 8 })).toBe(42);
    expect(answerFor("mul", { top: 6, bottom: 7 })).toBe(42);
  });
});

describe("buildMixedDrill", () => {
  const tables = { from: 2, to: 12 };

  it("splits the count evenly across the enabled ops", () => {
    const problems = buildMixedDrill(["add", "sub", "mul"], 24, tables, 1);
    expect(problems).toHaveLength(24);
    for (const op of ["add", "sub", "mul"] as const) {
      expect(problems.filter((p) => p.op === op)).toHaveLength(8);
    }
  });

  it("draws each op's facts from its own pool", () => {
    for (const p of buildMixedDrill(["add", "sub", "mul"], 36, tables, 2)) {
      if (p.op === "add") {
        expect(p.top).toBeGreaterThanOrEqual(1);
        expect(p.top).toBeLessThanOrEqual(9);
        expect(p.bottom).toBeGreaterThanOrEqual(1);
        expect(p.bottom).toBeLessThanOrEqual(9);
      } else if (p.op === "sub") {
        expect(p.top - p.bottom).toBeGreaterThanOrEqual(1);
        expect(p.top - p.bottom).toBeLessThanOrEqual(9);
        expect(p.bottom).toBeGreaterThanOrEqual(1);
        expect(p.bottom).toBeLessThanOrEqual(9);
      } else {
        expect(p.top).toBeGreaterThanOrEqual(tables.from);
        expect(p.top).toBeLessThanOrEqual(tables.to);
        expect(p.bottom).toBeGreaterThanOrEqual(1);
        expect(p.bottom).toBeLessThanOrEqual(12);
      }
    }
  });

  it("interleaves the ops rather than grouping them in blocks", () => {
    const ops = buildMixedDrill(["add", "sub", "mul"], 36, tables, 3).map(
      (p) => p.op,
    );
    // Grouped output would change op at most twice across the sheet.
    const switches = ops.filter((op, i) => i > 0 && op !== ops[i - 1]).length;
    expect(switches).toBeGreaterThan(2);
  });

  it("cycles a small multiplication pool instead of coming up short", () => {
    const problems = buildMixedDrill(["mul"], 24, { from: 2, to: 2 }, 4);
    expect(problems).toHaveLength(24);
    for (const p of problems) {
      expect(p.top).toBe(2);
      expect(p.bottom).toBeGreaterThanOrEqual(1);
      expect(p.bottom).toBeLessThanOrEqual(12);
    }
  });

  it("is deterministic per seed and varies across seeds", () => {
    expect(buildMixedDrill(["add", "mul"], 24, tables, 7)).toEqual(
      buildMixedDrill(["add", "mul"], 24, tables, 7),
    );
    expect(buildMixedDrill(["add", "mul"], 24, tables, 7)).not.toEqual(
      buildMixedDrill(["add", "mul"], 24, tables, 8),
    );
  });
});

describe("buildMixedBig", () => {
  const specs = [
    { op: "add" as const, xDigits: 2, yDigits: 1, carry: "mix" as const },
    { op: "sub" as const, xDigits: 3, yDigits: 2, carry: "no" as const },
  ];

  it("splits the count evenly across the specs and tags each problem", () => {
    const problems = buildMixedBig(specs, 20, 1);
    expect(problems).toHaveLength(20);
    expect(problems.filter((p) => p.op === "add")).toHaveLength(10);
    expect(problems.filter((p) => p.op === "sub")).toHaveLength(10);
  });

  it("honors each op's own options", () => {
    for (const p of buildMixedBig(specs, 30, 2)) {
      if (p.op === "add") {
        expect(
          [digitCount(p.top), digitCount(p.bottom)].sort(),
          `${p.top}+${p.bottom}`,
        ).toEqual([1, 2]);
      } else {
        expect(digitCount(p.top)).toBe(3);
        expect(digitCount(p.bottom)).toBe(2);
        expect(hasBorrow(p.top, p.bottom), `${p.top}-${p.bottom}`).toBe(false);
      }
    }
  });

  it("shuffles the ops together rather than grouping them", () => {
    const ops = buildMixedBig(specs, 20, 3).map((p) => p.op);
    // Grouped output would change op at most once across the sheet.
    const switches = ops.filter((op, i) => i > 0 && op !== ops[i - 1]).length;
    expect(switches).toBeGreaterThan(1);
  });

  it("is deterministic per seed and varies across seeds", () => {
    expect(buildMixedBig(specs, 12, 9)).toEqual(buildMixedBig(specs, 12, 9));
    expect(buildMixedBig(specs, 12, 9)).not.toEqual(buildMixedBig(specs, 12, 10));
  });

  it("supports a multiplication spec alongside add/sub", () => {
    const withMul = [
      ...specs,
      { op: "mul" as const, xDigits: 3, yDigits: 2, carry: "yes" as const },
    ];
    const problems = buildMixedBig(withMul, 30, 5);
    expect(problems).toHaveLength(30);
    const muls = problems.filter((p) => p.op === "mul");
    expect(muls).toHaveLength(10);
    for (const p of muls) {
      expect(digitCount(p.top)).toBe(3);
      expect(digitCount(p.bottom)).toBe(2);
      expect(hasMulRegroup(p.top, p.bottom), `${p.top}×${p.bottom}`).toBe(true);
    }
  });
});
