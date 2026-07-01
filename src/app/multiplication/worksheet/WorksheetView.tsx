"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AnswerKey,
  KeyToggle,
  type KeySection,
} from "@/components/arithmetic/AnswerKey";
import { NameInput } from "@/components/arithmetic/NameInput";
import { Sparkle as CarnivalSparkle, Star } from "@/components/carnival";
import { SheetHeader } from "@/components/sheet";
import { shuffle } from "@/lib/random";

type Range = { from: number; to: number };
type Problem = { a: number; b: number };
type Section = { kind: "in-order" | "random"; label: string; problems: Problem[] };

function buildInOrder(range: Range): Problem[] {
  const out: Problem[] = [];
  for (let a = range.from; a <= range.to; a++) {
    for (let b = 1; b <= 12; b++) out.push({ a, b });
  }
  return out;
}

function buildRandom(range: Range, seed: number): Problem[] {
  return shuffle(buildInOrder(range), seed);
}

function rangeLabel(r: Range): string {
  return r.from === r.to ? `Table ${r.from}` : `Tables ${r.from}–${r.to}`;
}

export default function WorksheetView({
  inOrder,
  random,
}: {
  inOrder: Range | null;
  random: Range | null;
}) {
  // Seed only matters for random; default to a fixed value so SSR == first client render,
  // then swap to a random seed after mount so each visit gets a fresh shuffle.
  const [seed, setSeed] = useState<number>(1);
  const [showKey, setShowKey] = useState(true);
  const [name, setName] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeed(Math.floor(Math.random() * 2 ** 31));
  }, []);

  const sections: Section[] = useMemo(() => {
    const s: Section[] = [];
    if (random) {
      s.push({
        kind: "random",
        label: rangeLabel(random),
        problems: buildRandom(random, seed),
      });
    }
    if (inOrder) {
      s.push({
        kind: "in-order",
        label: rangeLabel(inOrder),
        problems: buildInOrder(inOrder),
      });
    }
    return s;
  }, [inOrder, random, seed]);

  const totalProblems = sections.reduce((n, s) => n + s.problems.length, 0);

  // Mirror the worksheet's continuous numbering across sections.
  let keyRunning = 1;
  const keySections: KeySection[] = sections.map((section) => {
    const entries = section.problems.map((p, i) => ({
      n: keyRunning + i,
      answer: p.a * p.b,
    }));
    keyRunning += section.problems.length;
    return {
      title: `${section.kind === "random" ? "Random" : "In order"} · ${section.label}`,
      entries,
    };
  });

  if (sections.length === 0) {
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
            Head back to setup and pick at least one range.
          </p>
          <Link
            href="/multiplication"
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
                style={{
                  fontFamily: "var(--font-bagel)",
                  color: "#ff3d6e",
                }}
              >
                FOOLSCAP!
              </Link>
              <Link
                href="/multiplication"
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
                  <span style={{ color: "#3aa5f0" }}>YOUR</span>{" "}
                  <span style={{ color: "#ff3d6e" }}>SHEET!</span>
                </h1>
                <p className="mt-4 text-base font-bold uppercase tracking-wide text-ink">
                  {totalProblems} problems ·{" "}
                  {sections.map((s) => s.label).join(" → ")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <NameInput value={name} onChange={setName} />
                <KeyToggle on={showKey} onToggle={() => setShowKey((v) => !v)} />
                {random && (
                  <button
                    type="button"
                    onClick={() =>
                      setSeed(Math.floor(Math.random() * 2 ** 31))
                    }
                    className="group inline-flex -rotate-2 items-center gap-2 rounded-full border-[3px] border-ink bg-paper px-4 py-2 text-sm font-bold uppercase tracking-wide text-ink shadow-[4px_4px_0_var(--ink)] transition-transform hover:rotate-0 hover:-translate-y-0.5"
                    style={{ fontFamily: "var(--font-bagel)" }}
                  >
                    <span className="text-xl leading-none group-hover:rotate-180 transition-transform duration-500">
                      ↻
                    </span>
                    Re-shuffle
                  </button>
                )}
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
                  <Star
                    className="absolute -bottom-3 -right-3 h-5 w-5"
                    color="#39c172"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Worksheet body — also the print target */}
      <div
        className="print:bg-white"
        style={{ backgroundColor: "#fff5dc" }}
      >
        <article className="mx-auto w-full max-w-5xl px-6 pb-24 pt-2 sm:px-10 print:max-w-none print:px-0 print:pb-0 print:pt-0">
          <div className="border-[4px] border-ink bg-paper p-6 text-ink shadow-[8px_8px_0_var(--ink)] print:border-0 print:bg-white print:p-0 print:text-black print:shadow-none">
          {/* Worksheet header — printed once */}
          <SheetHeader
            tag="Foolscap · No. 01"
            title="Multiplication Worksheet"
            meta={sections
              .map((s) => `${s.kind === "in-order" ? "In order" : "Random"}: ${s.label}`)
              .join("  ·  ")}
            fields={[
              { label: "Name", value: name || undefined },
              { label: "Date" },
              { label: "Score", suffix: `/ ${totalProblems}` },
            ]}
          />

          {sections.map((section, sIdx) => (
            <SectionBlock
              key={section.kind}
              section={section}
              startNumber={
                sections
                  .slice(0, sIdx)
                  .reduce((n, s) => n + s.problems.length, 0) + 1
              }
            />
          ))}

          {showKey && <AnswerKey sections={keySections} name={name || undefined} />}
          </div>
        </article>
      </div>
    </>
  );
}

function SectionBlock({
  section,
  startNumber,
}: {
  section: Section;
  startNumber: number;
}) {
  const isRandom = section.kind === "random";
  return (
    <section className="mb-8 print:mb-6" style={{ breakInside: "auto" }}>
      <header className="mb-4 flex items-baseline justify-between border-b-2 border-ink pb-2 print:border-b print:border-black">
        <div className="flex items-baseline gap-3">
          <span
            className="text-2xl uppercase tracking-tight print:font-[family-name:var(--font-fraunces)] print:text-xl print:normal-case"
            style={{ fontFamily: "var(--font-bagel)" }}
          >
            {isRandom ? "Random ↯" : "In order →"}
          </span>
          <span className="num-tag text-xs uppercase tracking-[0.18em] text-ink-soft print:text-black">
            {section.label} · {section.problems.length} problems
          </span>
        </div>
        <span className="num-tag text-[10px] uppercase tracking-[0.22em] text-ink-soft print:text-black">
          {isRandom ? "shuffled ↯" : "by table →"}
        </span>
      </header>

      {isRandom ? (
        <RandomGrid section={section} startNumber={startNumber} />
      ) : (
        <InOrderTables section={section} startNumber={startNumber} />
      )}
    </section>
  );
}

function RandomGrid({
  section,
  startNumber,
}: {
  section: Section;
  startNumber: number;
}) {
  return (
    <ol className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 print:gap-x-6 print:gap-y-3">
      {section.problems.map((p, i) => {
        const n = startNumber + i;
        return (
          <li
            key={`r-${i}`}
            className="num-tag flex items-end gap-3 whitespace-nowrap text-xl print:text-lg"
            style={{ breakInside: "avoid" }}
          >
            <span className="w-7 shrink-0 self-center text-right text-xs text-ink-soft print:text-black">
              {n}.
            </span>
            <span className="font-semibold leading-none">
              {p.a} × {p.b} =
            </span>
            <span className="answer-line flex-1" />
          </li>
        );
      })}
    </ol>
  );
}

const TABLE_COLORS = [
  "#ff3d6e",
  "#ffb627",
  "#39c172",
  "#3aa5f0",
  "#9b4dff",
  "#ff6fb5",
  "#ffd23f",
  "#e2511a",
  "#4f7d5e",
  "#2f5aa6",
  "#c93b6e",
];

function InOrderTables({
  section,
  startNumber,
}: {
  section: Section;
  startNumber: number;
}) {
  // Group problems by multiplier (a) preserving order
  const groups = new Map<number, Problem[]>();
  for (const p of section.problems) {
    const arr = groups.get(p.a) ?? [];
    arr.push(p);
    groups.set(p.a, arr);
  }
  const tableNumbers = Array.from(groups.keys()).sort((a, b) => a - b);

  // Pre-compute starting problem number per table
  let running = startNumber;
  const tableStarts: Record<number, number> = {};
  for (const num of tableNumbers) {
    tableStarts[num] = running;
    running += groups.get(num)!.length;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 print:gap-3">
      {tableNumbers.map((num, idx) => (
        <MiniTable
          key={num}
          number={num}
          problems={groups.get(num)!}
          startNumber={tableStarts[num]}
          color={TABLE_COLORS[idx % TABLE_COLORS.length]}
        />
      ))}
    </div>
  );
}

function MiniTable({
  number,
  problems,
  startNumber,
  color,
}: {
  number: number;
  problems: Problem[];
  startNumber: number;
  color: string;
}) {
  return (
    <div
      className="overflow-hidden border-[3px] border-ink shadow-[4px_4px_0_var(--ink)] print:border print:border-black print:shadow-none"
      style={{ breakInside: "avoid" }}
    >
      <div
        className="border-b-[3px] border-ink py-2 text-center print:border-b print:border-black print:bg-white"
        style={{ backgroundColor: color }}
      >
        <span
          className="text-3xl uppercase leading-none text-ink print:font-[family-name:var(--font-fraunces)] print:text-xl print:normal-case print:font-bold"
          style={{ fontFamily: "var(--font-bagel)" }}
        >
          × {number}
        </span>
      </div>
      <ol className="bg-paper p-3 print:bg-white print:p-2">
        {problems.map((p, i) => (
          <li
            key={i}
            className="num-tag flex items-end gap-2 whitespace-nowrap py-1.5 text-lg print:py-1 print:text-[15px]"
          >
            <span className="w-5 shrink-0 self-center text-right text-[10px] text-ink-soft print:text-black">
              {startNumber + i}
            </span>
            <span className="font-semibold leading-none">
              {p.a} × {p.b} =
            </span>
            <span className="answer-line-sm flex-1" />
          </li>
        ))}
      </ol>
    </div>
  );
}

