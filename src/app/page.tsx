"use client";

import { useEffect, useState } from "react";

type Problem = { a: number; b: number };

function buildProblems(): Problem[] {
  const problems: Problem[] = [];
  for (let a = 2; a <= 12; a++) {
    for (let b = 1; b <= 12; b++) {
      problems.push({ a, b });
    }
  }
  return problems;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function Home() {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    setProblems(shuffle(buildProblems()));
  }, []);

  const reshuffle = () => setProblems(shuffle(buildProblems()));
  const print = () => window.print();

  const pageSize = 66;
  const pages: Problem[][] = [];
  for (let i = 0; i < problems.length; i += pageSize) {
    pages.push(problems.slice(i, i + pageSize));
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-5xl px-6 py-8 print:max-w-none print:p-0">
        <div className="mb-6 flex items-center justify-end gap-2 print:hidden">
          <button
            onClick={reshuffle}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Shuffle
          </button>
          <button
            onClick={print}
            className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Print
          </button>
        </div>

        {pages.map((pageProblems, pageIdx) => (
          <section
            key={pageIdx}
            className={`flex flex-col ${
              pageIdx > 0 ? "mt-12 print:mt-0" : ""
            } print:h-screen print:break-after-page print:last:break-after-auto`}
          >
            <header className="mb-4 flex items-end justify-between print:mb-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight print:text-xl">
                  Multiplication Worksheet
                </h1>
                <p className="text-sm text-zinc-600 print:text-xs">
                  Page {pageIdx + 1} of {pages.length} — {pageProblems.length} problems
                </p>
              </div>
            </header>

            <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm print:mb-3 print:gap-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Name:</span>
                <span className="flex-1 border-b border-zinc-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Date:</span>
                <span className="flex-1 border-b border-zinc-400" />
              </div>
            </div>

            <ol className="grid flex-1 grid-cols-3 auto-rows-fr gap-x-6 text-base tabular-nums print:gap-x-4 print:text-base">
              {pageProblems.map((p, i) => {
                const globalIdx = pageIdx * pageSize + i + 1;
                return (
                  <li
                    key={i}
                    className="flex items-baseline gap-2 whitespace-nowrap"
                  >
                    <span className="w-7 shrink-0 text-right text-xs text-zinc-500">
                      {globalIdx}.
                    </span>
                    <span className="font-medium">
                      {p.a} × {p.b} =
                    </span>
                    <span className="inline-block w-20 border-b border-zinc-400 print:w-16" />
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
