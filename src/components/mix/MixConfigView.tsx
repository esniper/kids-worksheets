"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CarnivalHeading, Confetti, Sparkle, Star } from "@/components/carnival";
import { Choice, OptionRow } from "@/components/config-controls";
import { OP_META } from "@/components/arithmetic/op-meta";
import type { CarryMode, DrillOp, Op } from "@/lib/arithmetic";
import {
  BIG_COUNTS,
  MIX_DRILL_COUNTS,
  MIX_TABLE_MAX,
  MIX_TABLE_MIN,
} from "@/lib/sheet-config";

const HEADING_COLORS = [
  "#3aa5f0",
  "#9b4dff",
  "#ff6fb5",
  "#ff3d6e",
  "#ffb627",
  "#39c172",
  "#3aa5f0",
  "#9b4dff",
  "#ff6fb5",
  "#ffd23f",
];

const DRILL_OPS: Array<{ op: DrillOp; label: string }> = [
  { op: "add", label: "✚ Addition" },
  { op: "sub", label: "− Subtraction" },
  { op: "mul", label: "× Multiplication" },
];

const BIG_OPS: Array<{ op: Op; label: string }> = [
  { op: "add", label: "✚ Addition" },
  { op: "sub", label: "− Subtraction" },
];

const TABLE_NUMBERS = Array.from(
  { length: MIX_TABLE_MAX - MIX_TABLE_MIN + 1 },
  (_, i) => MIX_TABLE_MIN + i,
);

type BigOpState = { xDigits: number; yDigits: number; carry: CarryMode };

export default function MixConfigView() {
  const router = useRouter();

  const [drillOps, setDrillOps] = useState<DrillOp[]>(["add", "sub", "mul"]);
  const [drillCount, setDrillCount] = useState(24);
  const [tableFrom, setTableFrom] = useState(2);
  const [tableTo, setTableTo] = useState(12);

  const [bigOps, setBigOps] = useState<Op[]>(["add", "sub"]);
  const [bigCount, setBigCount] = useState(20);
  const [addOpts, setAddOpts] = useState<BigOpState>({
    xDigits: 2,
    yDigits: 1,
    carry: "mix",
  });
  const [subOpts, setSubOpts] = useState<BigOpState>({
    xDigits: 2,
    yDigits: 1,
    carry: "mix",
  });

  const toggleDrillOp = (op: DrillOp) =>
    setDrillOps((prev) =>
      prev.includes(op) ? prev.filter((o) => o !== op) : [...prev, op],
    );
  const toggleBigOp = (op: Op) =>
    setBigOps((prev) =>
      prev.includes(op) ? prev.filter((o) => o !== op) : [...prev, op],
    );

  const pickTableFrom = (n: number) => {
    setTableFrom(n);
    if (n > tableTo) setTableTo(n);
  };
  const pickTableTo = (n: number) => {
    setTableTo(n);
    if (n < tableFrom) setTableFrom(n);
  };

  // Subtraction keeps the wider number on top so answers stay positive;
  // 1-digit minus 1-digit can never be forced to borrow.
  const pickSubX = (x: number) =>
    setSubOpts((prev) => {
      const yDigits = Math.min(prev.yDigits, x);
      const carry =
        prev.carry === "yes" && x === 1 && yDigits === 1 ? "mix" : prev.carry;
      return { xDigits: x, yDigits, carry };
    });
  const pickSubY = (y: number) =>
    setSubOpts((prev) => {
      const carry =
        prev.carry === "yes" && prev.xDigits === 1 && y === 1
          ? "mix"
          : prev.carry;
      return { ...prev, yDigits: y, carry };
    });
  const subBorrowImpossible = subOpts.xDigits === 1 && subOpts.yDigits === 1;

  const drillOn = drillOps.length > 0;
  const bigOn = bigOps.length > 0;
  const total = (drillOn ? drillCount : 0) + (bigOn ? bigCount : 0);
  const canSubmit = total > 0;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const params = new URLSearchParams();
    if (drillOn) {
      params.set("drill", drillOps.join(","));
      params.set("dcount", String(drillCount));
      if (drillOps.includes("mul")) {
        params.set("from", String(tableFrom));
        params.set("to", String(tableTo));
      }
    }
    if (bigOn) {
      params.set("big", bigOps.join(","));
      params.set("bcount", String(bigCount));
      if (bigOps.includes("add")) {
        params.set("ax", String(addOpts.xDigits));
        params.set("ay", String(addOpts.yDigits));
        params.set("acarry", addOpts.carry);
      }
      if (bigOps.includes("sub")) {
        params.set("sx", String(subOpts.xDigits));
        params.set("sy", String(subOpts.yDigits));
        params.set("sborrow", subOpts.carry);
      }
    }
    router.push(`/mix/worksheet?${params.toString()}`);
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden pb-32 pt-8"
      style={{ backgroundColor: "#fff5dc" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ff3d6e 1.6px, transparent 2px), radial-gradient(circle, #3aa5f0 1.6px, transparent 2px)",
          backgroundSize: "44px 44px, 44px 44px",
          backgroundPosition: "0 0, 22px 22px",
        }}
        aria-hidden
      />
      <Confetti />

      <div className="relative mx-auto w-full max-w-4xl px-6 sm:px-10">
        <header className="flex items-baseline justify-between">
          <Link
            href="/"
            className="text-3xl transition-opacity hover:opacity-70"
            style={{ fontFamily: "var(--font-bagel)", color: "#ff3d6e" }}
          >
            FOOLSCAP!
          </Link>
          <Link
            href="/"
            className="rounded-full border-[3px] border-ink bg-paper px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-ink shadow-[3px_3px_0_var(--ink)] transition-transform hover:-translate-y-0.5"
            style={{ fontFamily: "var(--font-bagel)" }}
          >
            ← Home
          </Link>
        </header>

        <section className="relative mt-20 sm:mt-24">
          <span
            className="mb-6 inline-block -rotate-2 rounded-full border-[3px] border-ink bg-paper px-5 py-1.5 text-base font-bold uppercase tracking-wide text-ink shadow-[4px_4px_0_var(--ink)]"
            style={{ fontFamily: "var(--font-bagel)" }}
          >
            Step 1 of 2 · Mix It Up
          </span>
          <h1
            className="text-[clamp(2.5rem,9vw,6rem)] uppercase leading-[0.95] tracking-tight"
            style={{ fontFamily: "var(--font-bagel)" }}
          >
            <span className="block">
              <CarnivalHeading
                word="MIX"
                colors={["#ff3d6e", "#ffb627", "#39c172"]}
              />
            </span>
            <span className="block">
              <CarnivalHeading word="IT ALL UP!" colors={HEADING_COLORS} />
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg font-semibold leading-snug text-ink">
            One sheet, every trick: shuffled speed-drill facts and big stacked
            numbers from whichever operations you switch on.
          </p>
        </section>

        <form onSubmit={onSubmit} className="mt-14 flex flex-col gap-8">
          <SectionPanel
            title="Speed Drill"
            badge={drillOn ? `${drillCount} facts` : "off"}
            color="#ffb627"
            active={drillOn}
          >
            <OptionRow label="Operations">
              {DRILL_OPS.map(({ op, label }) => (
                <Choice
                  key={op}
                  selected={drillOps.includes(op)}
                  onClick={() => toggleDrillOp(op)}
                  color="#ffb627"
                >
                  {label}
                </Choice>
              ))}
            </OptionRow>
            {drillOps.includes("mul") && (
              <>
                <OptionRow label="Tables from">
                  {TABLE_NUMBERS.map((n) => (
                    <Choice
                      key={n}
                      selected={tableFrom === n}
                      onClick={() => pickTableFrom(n)}
                      color="#39c172"
                    >
                      {n}
                    </Choice>
                  ))}
                </OptionRow>
                <OptionRow label="Tables to">
                  {TABLE_NUMBERS.map((n) => (
                    <Choice
                      key={n}
                      selected={tableTo === n}
                      onClick={() => pickTableTo(n)}
                      color="#39c172"
                    >
                      {n}
                    </Choice>
                  ))}
                </OptionRow>
              </>
            )}
            <OptionRow label="How many" last>
              {MIX_DRILL_COUNTS.map((c) => (
                <Choice
                  key={c}
                  selected={drillCount === c}
                  onClick={() => setDrillCount(c)}
                  color="#ffb627"
                >
                  {c}
                </Choice>
              ))}
            </OptionRow>
          </SectionPanel>

          <SectionPanel
            title="Big Numbers"
            badge={bigOn ? `${bigCount} problems` : "off"}
            color="#3aa5f0"
            active={bigOn}
          >
            <OptionRow label="Operations">
              {BIG_OPS.map(({ op, label }) => (
                <Choice
                  key={op}
                  selected={bigOps.includes(op)}
                  onClick={() => toggleBigOp(op)}
                  color="#3aa5f0"
                >
                  {label}
                </Choice>
              ))}
            </OptionRow>

            {bigOps.includes("add") && (
              <OpOptions heading="Addition">
                <OptionRow label={OP_META.add.xLabel}>
                  {[1, 2, 3].map((d) => (
                    <Choice
                      key={d}
                      selected={addOpts.xDigits === d}
                      onClick={() => setAddOpts((p) => ({ ...p, xDigits: d }))}
                      color={OP_META.add.accent}
                    >
                      {d} digit{d > 1 ? "s" : ""}
                    </Choice>
                  ))}
                </OptionRow>
                <OptionRow label={OP_META.add.yLabel}>
                  {[1, 2, 3].map((d) => (
                    <Choice
                      key={d}
                      selected={addOpts.yDigits === d}
                      onClick={() => setAddOpts((p) => ({ ...p, yDigits: d }))}
                      color={OP_META.add.accent}
                    >
                      {d} digit{d > 1 ? "s" : ""}
                    </Choice>
                  ))}
                </OptionRow>
                <OptionRow label="Carrying" last>
                  {(["no", "yes", "mix"] as const).map((mode) => (
                    <Choice
                      key={mode}
                      selected={addOpts.carry === mode}
                      onClick={() => setAddOpts((p) => ({ ...p, carry: mode }))}
                      color={OP_META.add.accentAlt}
                    >
                      {mode === "no"
                        ? "No carrying"
                        : mode === "yes"
                          ? "Carrying"
                          : "Mix"}
                    </Choice>
                  ))}
                </OptionRow>
              </OpOptions>
            )}

            {bigOps.includes("sub") && (
              <OpOptions heading="Subtraction">
                <OptionRow label={OP_META.sub.xLabel}>
                  {[1, 2, 3].map((d) => (
                    <Choice
                      key={d}
                      selected={subOpts.xDigits === d}
                      onClick={() => pickSubX(d)}
                      color={OP_META.sub.accent}
                    >
                      {d} digit{d > 1 ? "s" : ""}
                    </Choice>
                  ))}
                </OptionRow>
                <OptionRow label={OP_META.sub.yLabel}>
                  {[1, 2, 3].map((d) => (
                    <Choice
                      key={d}
                      selected={subOpts.yDigits === d}
                      disabled={d > subOpts.xDigits}
                      onClick={() => pickSubY(d)}
                      color={OP_META.sub.accent}
                    >
                      {d} digit{d > 1 ? "s" : ""}
                    </Choice>
                  ))}
                </OptionRow>
                <OptionRow label="Borrowing" last>
                  {(["no", "yes", "mix"] as const).map((mode) => (
                    <Choice
                      key={mode}
                      selected={subOpts.carry === mode}
                      disabled={mode === "yes" && subBorrowImpossible}
                      onClick={() => setSubOpts((p) => ({ ...p, carry: mode }))}
                      color={OP_META.sub.accentAlt}
                    >
                      {mode === "no"
                        ? "No borrowing"
                        : mode === "yes"
                          ? "Borrowing"
                          : "Mix"}
                    </Choice>
                  ))}
                </OptionRow>
              </OpOptions>
            )}

            <OptionRow label="How many" last>
              {BIG_COUNTS.map((c) => (
                <Choice
                  key={c}
                  selected={bigCount === c}
                  onClick={() => setBigCount(c)}
                  color="#3aa5f0"
                >
                  {c}
                </Choice>
              ))}
            </OptionRow>
          </SectionPanel>

          <div className="mt-6 flex flex-col items-start gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="relative">
              <span
                className="inline-block -rotate-2 rounded-full border-[3px] border-ink bg-paper px-4 py-1 text-sm font-bold uppercase tracking-wide text-ink shadow-[3px_3px_0_var(--ink)]"
                style={{ fontFamily: "var(--font-bagel)" }}
              >
                Total
              </span>
              <p
                className="mt-3 flex items-baseline gap-3 text-7xl uppercase leading-none tracking-tight text-ink"
                style={{ fontFamily: "var(--font-bagel)" }}
              >
                <span style={{ color: "#9b4dff" }}>{total}</span>
                <span className="text-base font-bold text-ink">problems</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="group relative inline-flex -rotate-2 items-center gap-3 border-[4px] border-ink bg-ink px-7 py-4 text-paper shadow-[8px_8px_0_#ffb627] transition-all hover:rotate-0 hover:shadow-[10px_10px_0_#ff3d6e] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:rotate-[-2deg] disabled:hover:shadow-[8px_8px_0_#ffb627]"
            >
              <Sparkle
                className="absolute -left-3 -top-3 h-6 w-6"
                style={{ color: "#ffd23f" }}
              />
              <span
                className="text-2xl uppercase tracking-tight"
                style={{ fontFamily: "var(--font-bagel)" }}
              >
                Generate!
              </span>
              <span
                className="text-2xl transition-transform group-hover:translate-x-1"
                style={{ fontFamily: "var(--font-bagel)" }}
                aria-hidden
              >
                →
              </span>
              <Star className="absolute -bottom-3 -right-3 h-6 w-6" color="#39c172" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function SectionPanel({
  title,
  badge,
  color,
  active,
  children,
}: {
  title: string;
  badge: string;
  color: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <fieldset
      className={`relative border-[4px] border-ink bg-paper p-5 pt-7 shadow-[6px_6px_0_var(--ink)] transition-opacity sm:p-6 sm:pt-7 ${
        active ? "" : "opacity-60"
      }`}
    >
      <legend
        className="ml-2 -rotate-1 border-[3px] border-ink px-4 py-1 text-xl uppercase leading-none text-ink shadow-[3px_3px_0_var(--ink)]"
        style={{ fontFamily: "var(--font-bagel)", backgroundColor: color }}
      >
        {title}
      </legend>
      <span
        className="absolute -top-3 right-4 rounded-full border-[2.5px] border-ink bg-paper px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink"
        style={{ fontFamily: "var(--font-bagel)" }}
      >
        {badge}
      </span>
      {children}
    </fieldset>
  );
}

function OpOptions({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 border-l-[4px] border-ink/20 pl-4">
      <span
        className="text-base uppercase tracking-wide text-ink-soft"
        style={{ fontFamily: "var(--font-bagel)" }}
      >
        {heading}
      </span>
      {children}
    </div>
  );
}
