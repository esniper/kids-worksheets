import type { Op } from "@/lib/arithmetic";

// Everything that distinguishes the addition pages from the subtraction
// pages lives here; the components themselves are op-agnostic.
export const OP_META: Record<
  Op,
  {
    slug: string;
    name: string;
    symbol: string;
    sheetNo: string;
    accent: string;
    accentAlt: string;
    carryWord: string;
    headingTop: string;
    headingBottom: string;
    // Labels for the two big-number digit pickers. Addition is commutative,
    // so its operands aren't tied to a stacking position.
    xLabel: string;
    yLabel: string;
  }
> = {
  add: {
    slug: "addition",
    name: "Addition",
    symbol: "+",
    sheetNo: "02",
    accent: "#ffb627",
    accentAlt: "#3aa5f0",
    carryWord: "carrying",
    headingTop: "ADD",
    headingBottom: "THEM UP!",
    xLabel: "First number",
    yLabel: "Second number",
  },
  sub: {
    slug: "subtraction",
    name: "Subtraction",
    symbol: "−",
    sheetNo: "03",
    accent: "#39c172",
    accentAlt: "#ff6fb5",
    carryWord: "borrowing",
    headingTop: "TAKE",
    headingBottom: "THEM AWAY!",
    xLabel: "Top number",
    yLabel: "Bottom number",
  },
};
