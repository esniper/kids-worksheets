import { mulberry32, shuffle } from "./random";

export type Op = "add" | "sub";
export type CarryMode = "no" | "yes" | "mix";
export type ArithmeticProblem = { top: number; bottom: number };

export const DRILL_COUNT = 60;

export type BigNumbersOptions = {
  xDigits: number;
  yDigits: number;
  carry: CarryMode;
  count: number;
  seed: number;
};

// Full fact-family pool: 81 facts. Addition: a + b with a, b in 1..9.
// Subtraction: the inverse facts, (a + b) - b = a, so minuends reach 18
// while subtrahend and answer stay single-digit.
function drillFacts(op: Op): ArithmeticProblem[] {
  const facts: ArithmeticProblem[] = [];
  for (let a = 1; a <= 9; a++) {
    for (let b = 1; b <= 9; b++) {
      facts.push(op === "add" ? { top: a, bottom: b } : { top: a + b, bottom: b });
    }
  }
  return facts;
}

export function buildDrill(op: Op, seed: number): ArithmeticProblem[] {
  return shuffle(drillFacts(op), seed).slice(0, DRILL_COUNT);
}

export type DrillOp = "add" | "sub" | "mul";
export type TableRange = { from: number; to: number };
export type MixedProblem<O extends string = DrillOp> = ArithmeticProblem & {
  op: O;
};
export type MixedBigSpec = {
  op: Op;
  xDigits: number;
  yDigits: number;
  carry: CarryMode;
};

function mulFacts({ from, to }: TableRange): ArithmeticProblem[] {
  const facts: ArithmeticProblem[] = [];
  for (let a = from; a <= to; a++) {
    for (let b = 1; b <= 12; b++) facts.push({ top: a, bottom: b });
  }
  return facts;
}

function evenShares(count: number, parts: number): number[] {
  const base = Math.floor(count / parts);
  return Array.from({ length: parts }, (_, i) => base + (i < count % parts ? 1 : 0));
}

// One mixed pile of drill facts: each op contributes an even share from its
// own pool, then everything is shuffled together. A pool smaller than its
// share is re-dealt so the sheet never comes up short.
export function buildMixedDrill(
  ops: DrillOp[],
  count: number,
  tables: TableRange,
  seed: number,
): MixedProblem[] {
  const rand = mulberry32(seed);
  const nextSeed = () => Math.floor(rand() * 2 ** 31);
  const shares = evenShares(count, ops.length);
  const combined: MixedProblem[] = [];
  ops.forEach((op, i) => {
    const pool = op === "mul" ? mulFacts(tables) : drillFacts(op);
    const picked: ArithmeticProblem[] = [];
    while (picked.length < shares[i]) {
      picked.push(...shuffle(pool, nextSeed()).slice(0, shares[i] - picked.length));
    }
    combined.push(...picked.map((p) => ({ op, ...p })));
  });
  return shuffle(combined, nextSeed());
}

export function buildMixedBig(
  specs: MixedBigSpec[],
  count: number,
  seed: number,
): MixedProblem<Op>[] {
  const rand = mulberry32(seed);
  const nextSeed = () => Math.floor(rand() * 2 ** 31);
  const shares = evenShares(count, specs.length);
  const combined = specs.flatMap((spec, i) =>
    buildBigNumbers(spec.op, {
      xDigits: spec.xDigits,
      yDigits: spec.yDigits,
      carry: spec.carry,
      count: shares[i],
      seed: nextSeed(),
    }).map((p) => ({ op: spec.op, ...p })),
  );
  return shuffle(combined, nextSeed());
}

export function buildBigNumbers(
  op: Op,
  { xDigits, yDigits, carry, count, seed }: BigNumbersOptions,
): ArithmeticProblem[] {
  if (op === "sub" && carry === "yes" && xDigits === 1 && yDigits === 1) {
    throw new Error(
      "single-digit minus single-digit can never borrow when the answer is non-negative",
    );
  }
  const rand = mulberry32(seed);
  const problems: ArithmeticProblem[] = [];
  const seen = new Set<string>();
  // For addition the same fact in the opposite orientation is a duplicate.
  const key = (p: ArithmeticProblem) =>
    op === "add" && p.bottom > p.top
      ? `${p.bottom},${p.top}`
      : `${p.top},${p.bottom}`;
  while (problems.length < count) {
    let p = makeProblem(op, xDigits, yDigits, carry, rand);
    // Best-effort dedupe: bounded retries so small pools can't loop forever.
    for (let tries = 0; seen.has(key(p)) && tries < 20; tries++) {
      p = makeProblem(op, xDigits, yDigits, carry, rand);
    }
    seen.add(key(p));
    problems.push(p);
  }
  return problems;
}

function randInt(rand: () => number, lo: number, hi: number): number {
  return lo + Math.floor(rand() * (hi - lo + 1));
}

function fromDigits(digits: number[]): number {
  // digits[0] is the ones column
  let n = 0;
  for (let i = digits.length - 1; i >= 0; i--) n = n * 10 + digits[i];
  return n;
}

// Problems are built column-by-column so carry/borrow constraints hold by
// construction — no rejection loops that could spin on tight cases.
function makeProblem(
  op: Op,
  xDigits: number,
  yDigits: number,
  carry: CarryMode,
  rand: () => number,
): ArithmeticProblem {
  if (op === "sub") return makeSubtraction(xDigits, yDigits, carry, rand);
  // Addition is commutative: the digit picks are unordered, and each problem
  // randomly chooses which operand sits on top.
  const p = makeAddition(
    Math.max(xDigits, yDigits),
    Math.min(xDigits, yDigits),
    carry,
    rand,
  );
  return rand() < 0.5 ? p : { top: p.bottom, bottom: p.top };
}

function makeAddition(
  xDigits: number,
  yDigits: number,
  carry: CarryMode,
  rand: () => number,
): ArithmeticProblem {
  const t = new Array<number>(xDigits).fill(0);
  const b = new Array<number>(yDigits).fill(0);
  // Index of the column forced to carry; with raw column sum >= 10 a carry
  // happens there no matter what arrives from below.
  const forced = carry === "yes" ? randInt(rand, 0, yDigits - 1) : -1;

  for (let i = 0; i < xDigits; i++) {
    const tLeading = i === xDigits - 1;
    if (i >= yDigits) {
      t[i] = randInt(rand, tLeading ? 1 : 0, 9);
      continue;
    }
    const bLeading = i === yDigits - 1;
    if (i === forced) {
      t[i] = randInt(rand, 1, 9);
      b[i] = randInt(rand, 10 - t[i], 9);
    } else if (carry === "no") {
      // Keep every raw column sum <= 9 so no carry can ever start.
      b[i] = randInt(rand, bLeading ? 1 : 0, tLeading ? 8 : 9);
      t[i] = randInt(rand, tLeading ? 1 : 0, 9 - b[i]);
    } else {
      t[i] = randInt(rand, tLeading ? 1 : 0, 9);
      b[i] = randInt(rand, bLeading ? 1 : 0, 9);
    }
  }
  return { top: fromDigits(t), bottom: fromDigits(b) };
}

function makeSubtraction(
  xDigits: number,
  yDigits: number,
  carry: CarryMode,
  rand: () => number,
): ArithmeticProblem {
  const t = new Array<number>(xDigits).fill(0);
  const b = new Array<number>(yDigits).fill(0);

  if (carry === "yes") {
    // A column where the top digit is strictly smaller than the bottom digit
    // must borrow. When digit counts match, the leading pair is fixed
    // strictly greater so the whole answer stays positive.
    const sameLength = xDigits === yDigits;
    const forced = randInt(rand, 0, sameLength ? yDigits - 2 : yDigits - 1);
    for (let i = 0; i < xDigits; i++) {
      const tLeading = i === xDigits - 1;
      if (i >= yDigits) {
        t[i] = randInt(rand, tLeading ? 1 : 0, 9);
        continue;
      }
      const bLeading = i === yDigits - 1;
      if (sameLength && tLeading) {
        b[i] = randInt(rand, 1, 8);
        t[i] = randInt(rand, b[i] + 1, 9);
      } else if (i === forced) {
        b[i] = randInt(rand, 1, 9);
        t[i] = randInt(rand, 0, b[i] - 1);
      } else {
        t[i] = randInt(rand, tLeading ? 1 : 0, 9);
        b[i] = randInt(rand, bLeading ? 1 : 0, 9);
      }
    }
    return { top: fromDigits(t), bottom: fromDigits(b) };
  }

  if (carry === "no") {
    // Every top digit >= bottom digit: no column borrows, result >= 0.
    for (let i = 0; i < xDigits; i++) {
      const tLeading = i === xDigits - 1;
      if (i >= yDigits) {
        t[i] = randInt(rand, tLeading ? 1 : 0, 9);
        continue;
      }
      const bLeading = i === yDigits - 1;
      b[i] = randInt(rand, bLeading ? 1 : 0, 9);
      t[i] = randInt(rand, Math.max(b[i], tLeading ? 1 : 0), 9);
    }
    return { top: fromDigits(t), bottom: fromDigits(b) };
  }

  // Mix: unconstrained within digit counts, swapped if needed (only possible
  // when digit counts match) so the answer is never negative.
  const top = randInt(rand, xDigits === 1 ? 1 : 10 ** (xDigits - 1), 10 ** xDigits - 1);
  const bottom = randInt(rand, yDigits === 1 ? 1 : 10 ** (yDigits - 1), 10 ** yDigits - 1);
  return top >= bottom ? { top, bottom } : { top: bottom, bottom: top };
}
