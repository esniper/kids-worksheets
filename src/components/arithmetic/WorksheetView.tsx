"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Sparkle as CarnivalSparkle, Star } from "@/components/carnival";
import { SheetHeader, type SheetField } from "@/components/sheet";
import {
  DRILL_COUNT,
  buildBigNumbers,
  buildDrill,
  type ArithmeticProblem,
  type Op,
} from "@/lib/arithmetic";
import type { WorksheetConfig } from "@/lib/sheet-config";
import { OP_META } from "./op-meta";

function carryLabel(op: Op, carry: "no" | "yes" | "mix"): string {
  const word = OP_META[op].carryWord;
  if (carry === "no") return `no ${word}`;
  if (carry === "yes") return word;
  return `mixed ${word}`;
}

export default function ArithmeticWorksheetView({
  op,
  config,
}: {
  op: Op;
  config: WorksheetConfig | null;
}) {
  const meta = OP_META[op];

  // Fixed seed so SSR == first client render, then a fresh shuffle per visit.
  const [seed, setSeed] = useState<number>(1);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeed(Math.floor(Math.random() * 2 ** 31));
  }, []);

  const problems: ArithmeticProblem[] = useMemo(() => {
    if (!config) return [];
    if (config.mode === "drill") return buildDrill(op, seed);
    return buildBigNumbers(op, {
      xDigits: config.xDigits,
      yDigits: config.yDigits,
      carry: config.carry,
      count: config.count,
      seed,
    });
  }, [op, config, seed]);

  if (!config) {
    return (
      <main
        className="relative min-h-screen overflow-hidden pb-24 pt-16"
        style={{ backgroundColor: "#fff5dc" }}
      >
        <div className="mx-auto w-full max-w-2xl px-6 sm:px-10">
          <h1
            className="text-5xl uppercase leading-none tracking-tight text-ink"
            style={{ fontFamily: "var(--font-bagel)" }}
          >
            Nothing to print!
          </h1>
          <p className="mt-4 text-lg font-semibold text-ink">
            Head back to setup and pick a worksheet style.
          </p>
          <Link
            href={`/${meta.slug}`}
            className="mt-8 inline-flex -rotate-1 items-center gap-3 border-[4px] border-ink bg-ink px-5 py-3 text-paper shadow-[6px_6px_0_#ffb627] transition-transform hover:rotate-0"
          >
            <span
              className="text-xl uppercase"
              style={{ fontFamily: "var(--font-bagel)" }}
            >
              ← Back to setup
            </span>
          </Link>
        </div>
      </main>
    );
  }

  const isDrill = config.mode === "drill";
  const sheetMeta = isDrill
    ? `Speed drill · ${DRILL_COUNT} facts · write your times!`
    : `${config.xDigits}-digit ${meta.symbol} ${config.yDigits}-digit · ${carryLabel(op, config.carry)} · ${config.count} problems`;
  const fields: SheetField[] = isDrill
    ? [
        { label: "Name" },
        { label: "Date" },
        { label: "Start time" },
        { label: "End time" },
        { label: "Score", suffix: `/ ${problems.length}` },
      ]
    : [
        { label: "Name" },
        { label: "Date" },
        { label: "Score", suffix: `/ ${problems.length}` },
      ];

  return (
    <>
      {/* Screen-only toolbar — carnival */}
      <div className="print:hidden">
        <div
          className="relative overflow-hidden"
          style={{ backgroundColor: "#fff5dc" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ff3d6e 1.6px, transparent 2px), radial-gradient(circle, #3aa5f0 1.6px, transparent 2px)",
              backgroundSize: "44px 44px, 44px 44px",
              backgroundPosition: "0 0, 22px 22px",
            }}
            aria-hidden
          />

          <div className="relative mx-auto w-full max-w-5xl px-6 pb-10 pt-8 sm:px-10 sm:pt-10">
            <header className="flex items-baseline justify-between">
              <Link
                href="/"
                className="text-3xl transition-opacity hover:opacity-70"
                style={{ fontFamily: "var(--font-bagel)", color: "#ff3d6e" }}
              >
                FOOLSCAP!
              </Link>
              <Link
                href={`/${meta.slug}`}
                className="rounded-full border-[3px] border-ink bg-paper px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-ink shadow-[3px_3px_0_var(--ink)] transition-transform hover:-translate-y-0.5"
                style={{ fontFamily: "var(--font-bagel)" }}
              >
                ← Back to setup
              </Link>
            </header>

            <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <span
                  className="mb-4 inline-block -rotate-2 rounded-full border-[3px] border-ink bg-paper px-4 py-1 text-sm font-bold uppercase tracking-wide text-ink shadow-[3px_3px_0_var(--ink)]"
                  style={{ fontFamily: "var(--font-bagel)" }}
                >
                  Step 2 of 2 · Preview
                </span>
                <h1
                  className="text-[clamp(2.5rem,7vw,5rem)] uppercase leading-[0.95] tracking-tight"
                  style={{ fontFamily: "var(--font-bagel)" }}
                >
                  <span style={{ color: meta.accentAlt }}>YOUR</span>{" "}
                  <span style={{ color: "#ff3d6e" }}>SHEET!</span>
                </h1>
                <p className="mt-4 text-base font-bold uppercase tracking-wide text-ink">
                  {meta.name} · {sheetMeta}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSeed(Math.floor(Math.random() * 2 ** 31))}
                  className="group inline-flex -rotate-2 items-center gap-2 rounded-full border-[3px] border-ink bg-paper px-4 py-2 text-sm font-bold uppercase tracking-wide text-ink shadow-[4px_4px_0_var(--ink)] transition-transform hover:rotate-0 hover:-translate-y-0.5"
                  style={{ fontFamily: "var(--font-bagel)" }}
                >
                  <span className="text-xl leading-none transition-transform duration-500 group-hover:rotate-180">
                    ↻
                  </span>
                  Re-shuffle
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="group relative inline-flex rotate-2 items-center gap-3 border-[4px] border-ink bg-ink px-5 py-3 text-paper shadow-[6px_6px_0_#ffb627] transition-all hover:rotate-0 hover:shadow-[8px_8px_0_#ff3d6e]"
                >
                  <CarnivalSparkle
                    className="absolute -left-3 -top-3 h-5 w-5"
                    style={{ color: "#ffd23f" }}
                  />
                  <span
                    className="text-xl uppercase tracking-tight"
                    style={{ fontFamily: "var(--font-bagel)" }}
                  >
                    Print!
                  </span>
                  <span
                    className="text-xl transition-transform group-hover:translate-x-1"
                    style={{ fontFamily: "var(--font-bagel)" }}
                    aria-hidden
                  >
                    →
                  </span>
                  <Star className="absolute -bottom-3 -right-3 h-5 w-5" color="#39c172" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Worksheet body — also the print target */}
      <div className="print:bg-white" style={{ backgroundColor: "#fff5dc" }}>
        <article className="mx-auto w-full max-w-5xl px-6 pb-24 pt-2 sm:px-10 print:max-w-none print:px-0 print:pb-0 print:pt-0">
          <div className="border-[4px] border-ink bg-paper p-6 text-ink shadow-[8px_8px_0_var(--ink)] print:border-0 print:bg-white print:p-0 print:text-black print:shadow-none">
            <SheetHeader
              tag={`Foolscap · No. ${meta.sheetNo}`}
              title={`${meta.name} Worksheet`}
              meta={sheetMeta}
              fields={fields}
            />

            {isDrill ? (
              <DrillGrid symbol={meta.symbol} problems={problems} />
            ) : (
              <StackedGrid symbol={meta.symbol} problems={problems} />
            )}
          </div>
        </article>
      </div>
    </>
  );
}

function DrillGrid({
  symbol,
  problems,
}: {
  symbol: string;
  problems: ArithmeticProblem[];
}) {
  return (
    <ol className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-6 print:grid-cols-6 print:gap-x-4 print:gap-y-3">
      {problems.map((p, i) => (
        <li
          key={i}
          className="num-tag flex items-end gap-2 whitespace-nowrap text-lg print:text-[14px]"
          style={{ breakInside: "avoid" }}
        >
          <span className="w-6 shrink-0 self-center text-right text-[10px] text-ink-soft print:text-black">
            {i + 1}.
          </span>
          <span className="font-semibold leading-none">
            {p.top} {symbol} {p.bottom} =
          </span>
          <span className="answer-line-sm flex-1" />
        </li>
      ))}
    </ol>
  );
}

function StackedGrid({
  symbol,
  problems,
}: {
  symbol: string;
  problems: ArithmeticProblem[];
}) {
  return (
    <ol className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 print:grid-cols-4 print:gap-x-8 print:gap-y-6">
      {problems.map((p, i) => (
        <li key={i} className="flex gap-3" style={{ breakInside: "avoid" }}>
          <span className="num-tag w-7 shrink-0 pt-6 text-right text-xs text-ink-soft print:text-black">
            {i + 1}.
          </span>
          <div className="num-tag flex-1 text-right text-3xl font-semibold leading-snug print:text-2xl">
            {/* headroom above the top number for pencilled carry/borrow marks */}
            <div className="pt-5">{p.top}</div>
            <div className="flex items-end justify-between">
              <span className="pl-1 text-ink-soft print:text-black">{symbol}</span>
              <span>{p.bottom}</span>
            </div>
            <div className="mt-1 h-14 border-t-[2.5px] border-ink print:h-12 print:border-black" />
          </div>
        </li>
      ))}
    </ol>
  );
}
