"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CarnivalHeading, Confetti, Sparkle, Star } from "@/components/carnival";
import { Choice, OptionRow } from "@/components/config-controls";
import type { CarryMode, Op } from "@/lib/arithmetic";
import { BIG_COUNTS } from "@/lib/sheet-config";
import { OP_META } from "./op-meta";

type Mode = "drill" | "big";

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

export default function ArithmeticConfigView({ op }: { op: Op }) {
  const router = useRouter();
  const meta = OP_META[op];

  const [mode, setMode] = useState<Mode>("drill");
  const [xDigits, setXDigits] = useState(2);
  const [yDigits, setYDigits] = useState(1);
  const [carry, setCarry] = useState<CarryMode>("mix");
  const [count, setCount] = useState(20);

  // Single-digit minus single-digit can never borrow without going negative.
  const carryImpossible = op === "sub" && xDigits === 1 && yDigits === 1;

  const pickXDigits = (x: number) => {
    setXDigits(x);
    if (op === "sub") {
      // Subtraction keeps the wider number on top so answers stay positive.
      if (yDigits > x) setYDigits(x);
      // x = 1 forces y = 1, where forced borrowing is impossible
      if (carry === "yes" && x === 1) setCarry("mix");
    }
  };

  const total = mode === "drill" ? 60 : count;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("mode", mode);
    if (mode === "big") {
      params.set("x", String(xDigits));
      params.set("y", String(yDigits));
      params.set("carry", carry);
      params.set("count", String(count));
    }
    router.push(`/${meta.slug}/worksheet?${params.toString()}`);
  };

  const carryTitle = meta.carryWord[0].toUpperCase() + meta.carryWord.slice(1);

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
            Step 1 of 2 · {meta.name}
          </span>
          <h1
            className="text-[clamp(2.5rem,9vw,6rem)] uppercase leading-[0.95] tracking-tight"
            style={{ fontFamily: "var(--font-bagel)" }}
          >
            <span className="block">
              <CarnivalHeading
                word={meta.headingTop}
                colors={["#ff3d6e", "#ffb627", "#39c172", "#3aa5f0"]}
              />
            </span>
            <span className="block">
              <CarnivalHeading word={meta.headingBottom} colors={HEADING_COLORS} />
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg font-semibold leading-snug text-ink">
            Pick a style: a speed drill to race the clock, or big stacked
            numbers with or without {meta.carryWord}.
          </p>
        </section>

        <form onSubmit={onSubmit} className="mt-14">
          <div className="grid gap-5 sm:grid-cols-2" role="radiogroup" aria-label="Worksheet style">
            <ModeCard
              selected={mode === "drill"}
              onClick={() => setMode("drill")}
              color={meta.accent}
              title="Speed Drill"
              blurb="60 quick facts. Write your start and end time — race the clock!"
              badge="1 page · timed"
            />
            <ModeCard
              selected={mode === "big"}
              onClick={() => setMode("big")}
              color={meta.accentAlt}
              title="Big Numbers"
              blurb={`Stacked problems. Pick the digits, the ${meta.carryWord}, and how many.`}
              badge="up to 3 digits"
            />
          </div>

          {mode === "big" && (
            <div className="mt-8 border-[4px] border-ink bg-paper p-5 shadow-[6px_6px_0_var(--ink)] sm:p-6">
              <OptionRow label={meta.xLabel}>
                {[1, 2, 3].map((d) => (
                  <Choice
                    key={d}
                    selected={xDigits === d}
                    onClick={() => pickXDigits(d)}
                    color={meta.accent}
                  >
                    {d} digit{d > 1 ? "s" : ""}
                  </Choice>
                ))}
              </OptionRow>
              <OptionRow label={meta.yLabel}>
                {[1, 2, 3].map((d) => (
                  <Choice
                    key={d}
                    selected={yDigits === d}
                    disabled={op === "sub" && d > xDigits}
                    onClick={() => {
                      setYDigits(d);
                      if (op === "sub" && carry === "yes" && xDigits === 1 && d === 1) {
                        setCarry("mix");
                      }
                    }}
                    color={meta.accent}
                  >
                    {d} digit{d > 1 ? "s" : ""}
                  </Choice>
                ))}
              </OptionRow>
              <OptionRow label={carryTitle}>
                <Choice
                  selected={carry === "no"}
                  onClick={() => setCarry("no")}
                  color={meta.accentAlt}
                >
                  No {meta.carryWord}
                </Choice>
                <Choice
                  selected={carry === "yes"}
                  disabled={carryImpossible}
                  onClick={() => setCarry("yes")}
                  color={meta.accentAlt}
                >
                  {carryTitle}
                </Choice>
                <Choice
                  selected={carry === "mix"}
                  onClick={() => setCarry("mix")}
                  color={meta.accentAlt}
                >
                  Mix
                </Choice>
              </OptionRow>
              <OptionRow label="How many" last>
                {BIG_COUNTS.map((c) => (
                  <Choice
                    key={c}
                    selected={count === c}
                    onClick={() => setCount(c)}
                    color={meta.accent}
                  >
                    {c}
                  </Choice>
                ))}
              </OptionRow>
              {carryImpossible && (
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-ink-soft">
                  1-digit minus 1-digit can&apos;t borrow — pick a bigger top
                  number to practice it.
                </p>
              )}
            </div>
          )}

          <div className="mt-14 flex flex-col items-start gap-8 sm:flex-row sm:items-end sm:justify-between">
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
              className="group relative inline-flex -rotate-2 items-center gap-3 border-[4px] border-ink bg-ink px-7 py-4 text-paper shadow-[8px_8px_0_#ffb627] transition-all hover:rotate-0 hover:shadow-[10px_10px_0_#ff3d6e]"
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

function ModeCard({
  selected,
  onClick,
  color,
  title,
  blurb,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  color: string;
  title: string;
  blurb: string;
  badge: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`relative border-[4px] border-ink p-5 text-left transition-all ${
        selected
          ? "-rotate-1 shadow-[6px_6px_0_var(--ink)]"
          : "bg-paper opacity-70 shadow-[3px_3px_0_var(--ink)] hover:opacity-100"
      }`}
      style={{ backgroundColor: selected ? color : undefined }}
    >
      <span
        className="absolute -top-3 right-4 rounded-full border-[2.5px] border-ink bg-paper px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink"
        style={{ fontFamily: "var(--font-bagel)" }}
      >
        {badge}
      </span>
      <span
        className="block text-3xl uppercase leading-none text-ink"
        style={{ fontFamily: "var(--font-bagel)" }}
      >
        {title}
      </span>
      <p className="mt-3 text-sm font-semibold leading-snug text-ink">{blurb}</p>
    </button>
  );
}

