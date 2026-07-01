"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Sparkle as CarnivalSparkle, Star } from "@/components/carnival";
import {
  AnswerKey,
  KeyToggle,
  type KeySection,
} from "@/components/arithmetic/AnswerKey";
import { NameInput } from "@/components/arithmetic/NameInput";
import { DrillGrid, StackedGrid } from "@/components/arithmetic/grids";
import { SheetHeader, type SheetField } from "@/components/sheet";
import {
  answerFor,
  buildMixedBig,
  buildMixedDrill,
  type DrillOp,
} from "@/lib/arithmetic";
import type { MixConfig } from "@/lib/sheet-config";

const SYMBOLS: Record<DrillOp, string> = { add: "+", sub: "−", mul: "×" };
const OP_WORDS: Record<DrillOp, string> = {
  add: "addition",
  sub: "subtraction",
  mul: "multiplication",
};

export default function MixWorksheetView({
  config,
}: {
  config: MixConfig | null;
}) {
  // Fixed seed so SSR == first client render, then a fresh shuffle per visit.
  const [seed, setSeed] = useState<number>(1);
  const [showKey, setShowKey] = useState(true);
  const [name, setName] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeed(Math.floor(Math.random() * 2 ** 31));
  }, []);

  // Each problem keeps its op so the answer key can compute the right result;
  // the grids only read top/bottom/symbol and ignore the extra field.
  const { drillProblems, bigProblems } = useMemo(() => {
    if (!config) return { drillProblems: [], bigProblems: [] };
    return {
      drillProblems: config.drill
        ? buildMixedDrill(
            config.drill.ops,
            config.drill.count,
            config.drill.tables,
            seed,
          ).map((p) => ({ ...p, symbol: SYMBOLS[p.op] }))
        : [],
      bigProblems: config.big
        ? buildMixedBig(config.big.specs, config.big.count, seed + 1).map(
            (p) => ({ ...p, symbol: SYMBOLS[p.op] }),
          )
        : [],
    };
  }, [config, seed]);

  const keySections: KeySection[] = [];
  if (drillProblems.length > 0) {
    keySections.push({
      title: "Speed Drill",
      entries: drillProblems.map((p, i) => ({
        n: i + 1,
        answer: answerFor(p.op, p),
      })),
    });
  }
  if (bigProblems.length > 0) {
    keySections.push({
      title: "Big Numbers",
      entries: bigProblems.map((p, i) => ({
        n: drillProblems.length + i + 1,
        answer: answerFor(p.op, p),
      })),
    });
  }

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
            Head back to setup and switch on at least one section.
          </p>
          <Link
            href="/mix"
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

  const total = drillProblems.length + bigProblems.length;
  const metaParts: string[] = [];
  if (config.drill) {
    const ops = config.drill.ops.map((op) => OP_WORDS[op]).join(" · ");
    const tables = config.drill.ops.includes("mul")
      ? ` (tables ${config.drill.tables.from}–${config.drill.tables.to})`
      : "";
    metaParts.push(`Drill: ${ops}${tables} · ${config.drill.count} facts`);
  }
  if (config.big) {
    const ops = config.big.specs.map((s) => OP_WORDS[s.op]).join(" · ");
    metaParts.push(`Big numbers: ${ops} · ${config.big.count} problems`);
  }
  const sheetMeta = metaParts.join("  —  ");

  const fields: SheetField[] = [
    { label: "Name", value: name || undefined },
    { label: "Date" },
    ...(config.drill
      ? [{ label: "Start time" }, { label: "End time" }]
      : []),
    { label: "Score", suffix: `/ ${total}` },
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
                href="/mix"
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
                  <span style={{ color: "#9b4dff" }}>YOUR</span>{" "}
                  <span style={{ color: "#ff3d6e" }}>SHEET!</span>
                </h1>
                <p className="mt-4 text-base font-bold uppercase tracking-wide text-ink">
                  Mix It Up · {sheetMeta}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <NameInput value={name} onChange={setName} />
                <KeyToggle on={showKey} onToggle={() => setShowKey((v) => !v)} />
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
              tag="Foolscap · No. 04"
              title="Mix It Up Worksheet"
              meta={sheetMeta}
              fields={fields}
            />

            {drillProblems.length > 0 && (
              <MixSection
                title="Speed Drill ↯"
                note="every symbol counts — watch the signs!"
              >
                <DrillGrid problems={drillProblems} />
              </MixSection>
            )}

            {bigProblems.length > 0 && (
              <MixSection
                title="Big Numbers"
                note="stack them up — mind the symbol!"
              >
                <StackedGrid
                  problems={bigProblems}
                  startNumber={drillProblems.length + 1}
                />
              </MixSection>
            )}

            {showKey && (
              <AnswerKey sections={keySections} name={name || undefined} />
            )}
          </div>
        </article>
      </div>
    </>
  );
}

function MixSection({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 print:mb-6" style={{ breakInside: "auto" }}>
      <header className="mb-4 flex items-baseline justify-between border-b-2 border-ink pb-2 print:border-b print:border-black">
        <span
          className="text-2xl uppercase tracking-tight print:font-[family-name:var(--font-fraunces)] print:text-xl print:normal-case"
          style={{ fontFamily: "var(--font-bagel)" }}
        >
          {title}
        </span>
        <span className="num-tag text-[10px] uppercase tracking-[0.22em] text-ink-soft print:text-black">
          {note}
        </span>
      </header>
      {children}
    </section>
  );
}
