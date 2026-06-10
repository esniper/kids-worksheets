import type { CarryMode, Op } from "./arithmetic";

export type WorksheetConfig =
  | { mode: "drill" }
  | {
      mode: "big";
      xDigits: number;
      yDigits: number;
      carry: CarryMode;
      count: number;
    };

export const BIG_COUNTS = [12, 20, 30] as const;

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function parseDigits(raw: string | undefined, fallback: number): number {
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isNaN(n) ? fallback : clamp(n, 1, 3);
}

export function parseWorksheetParams(
  op: Op,
  sp: Record<string, string | undefined>,
): WorksheetConfig | null {
  if (sp.mode === "drill") return { mode: "drill" };
  if (sp.mode !== "big") return null;

  const xDigits = parseDigits(sp.x, 2);
  // Addition is commutative, so the digit picks are unordered; subtraction
  // needs the wider operand on top to keep answers non-negative.
  const yDigits =
    op === "add"
      ? parseDigits(sp.y, 1)
      : Math.min(parseDigits(sp.y, 1), xDigits);
  let carry: CarryMode =
    sp.carry === "no" || sp.carry === "yes" || sp.carry === "mix"
      ? sp.carry
      : "mix";
  // Single-digit minus single-digit can never borrow without going negative.
  if (op === "sub" && carry === "yes" && xDigits === 1 && yDigits === 1) {
    carry = "mix";
  }
  const count = Number.parseInt(sp.count ?? "", 10);
  return {
    mode: "big",
    xDigits,
    yDigits,
    carry,
    count: (BIG_COUNTS as readonly number[]).includes(count) ? count : 20,
  };
}
