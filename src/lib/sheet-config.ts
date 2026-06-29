import type {
  BigOp,
  CarryMode,
  DrillOp,
  MixedBigSpec,
  Op,
  TableRange,
} from "./arithmetic";

export type WorksheetConfig =
  | { mode: "drill" }
  | {
      mode: "big";
      xDigits: number;
      yDigits: number;
      carry: CarryMode;
      count: number;
    };

export type MixConfig = {
  drill: { ops: DrillOp[]; count: number; tables: TableRange } | null;
  big: { specs: MixedBigSpec[]; count: number } | null;
};

export const BIG_COUNTS = [12, 20, 30] as const;
export const MIX_DRILL_COUNTS = [12, 24, 36, 60] as const;
export const MIX_TABLE_MIN = 2;
export const MIX_TABLE_MAX = 12;
// Add/sub digit pickers top out at 3; multiplication operands go to 4.
export const BIG_MAX_DIGITS = 3;
export const MUL_MAX_DIGITS = 4;

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function parseDigits(
  raw: string | undefined,
  fallback: number,
  max = BIG_MAX_DIGITS,
): number {
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isNaN(n) ? fallback : clamp(n, 1, max);
}

function parseCarry(raw: string | undefined): CarryMode {
  return raw === "no" || raw === "yes" || raw === "mix" ? raw : "mix";
}

function pickCount(
  raw: string | undefined,
  allowed: readonly number[],
  fallback: number,
): number {
  const n = Number.parseInt(raw ?? "", 10);
  return allowed.includes(n) ? n : fallback;
}

function parseBigSpec(
  op: BigOp,
  x: string | undefined,
  y: string | undefined,
  carry: string | undefined,
): MixedBigSpec {
  // Multiplication keeps the operands exactly as configured (top × bottom) and
  // allows wider numbers; its carry field means regrouping, never impossible.
  if (op === "mul") {
    return {
      op,
      xDigits: parseDigits(x, 2, MUL_MAX_DIGITS),
      yDigits: parseDigits(y, 1, MUL_MAX_DIGITS),
      carry: parseCarry(carry),
    };
  }
  const xDigits = parseDigits(x, 2);
  // Addition is commutative, so the digit picks are unordered; subtraction
  // needs the wider operand on top to keep answers non-negative.
  const yDigits =
    op === "add" ? parseDigits(y, 1) : Math.min(parseDigits(y, 1), xDigits);
  let mode = parseCarry(carry);
  // Single-digit minus single-digit can never borrow without going negative.
  if (op === "sub" && mode === "yes" && xDigits === 1 && yDigits === 1) {
    mode = "mix";
  }
  return { op, xDigits, yDigits, carry: mode };
}

export function parseWorksheetParams(
  op: Op,
  sp: Record<string, string | undefined>,
): WorksheetConfig | null {
  if (sp.mode === "drill") return { mode: "drill" };
  if (sp.mode !== "big") return null;

  const { xDigits, yDigits, carry } = parseBigSpec(op, sp.x, sp.y, sp.carry);
  return {
    mode: "big",
    xDigits,
    yDigits,
    carry,
    count: pickCount(sp.count, BIG_COUNTS, 20),
  };
}

function parseOps<T extends string>(
  raw: string | undefined,
  valid: readonly T[],
): T[] {
  const requested = new Set((raw ?? "").split(","));
  return valid.filter((op) => requested.has(op));
}

function parseTables(
  fromRaw: string | undefined,
  toRaw: string | undefined,
): TableRange {
  const fromN = Number.parseInt(fromRaw ?? "", 10);
  const toN = Number.parseInt(toRaw ?? "", 10);
  const from = clamp(Number.isNaN(fromN) ? MIX_TABLE_MIN : fromN, MIX_TABLE_MIN, MIX_TABLE_MAX);
  const to = clamp(Number.isNaN(toN) ? MIX_TABLE_MAX : toN, MIX_TABLE_MIN, MIX_TABLE_MAX);
  return from <= to ? { from, to } : { from: to, to: from };
}

export function parseMixParams(
  sp: Record<string, string | undefined>,
): MixConfig | null {
  const drillOps = parseOps<DrillOp>(sp.drill, ["add", "sub", "mul"]);
  const bigOps = parseOps<BigOp>(sp.big, ["add", "sub", "mul"]);

  const drill = drillOps.length
    ? {
        ops: drillOps,
        count: pickCount(sp.dcount, MIX_DRILL_COUNTS, 24),
        tables: parseTables(sp.from, sp.to),
      }
    : null;

  const big = bigOps.length
    ? {
        count: pickCount(sp.bcount, BIG_COUNTS, 20),
        specs: bigOps.map((op) =>
          op === "add"
            ? parseBigSpec("add", sp.ax, sp.ay, sp.acarry)
            : op === "sub"
              ? parseBigSpec("sub", sp.sx, sp.sy, sp.sborrow)
              : parseBigSpec("mul", sp.mx, sp.my, sp.mregroup),
        ),
      }
    : null;

  return drill || big ? { drill, big } : null;
}
