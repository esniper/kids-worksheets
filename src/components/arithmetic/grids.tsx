"use client";

// Problem grids shared by the per-op worksheets and the mixed worksheet.
// Each problem carries its own symbol so a grid can mix operations.

export type GridProblem = { top: number; bottom: number; symbol: string };

export function DrillGrid({
  problems,
  startNumber = 1,
}: {
  problems: GridProblem[];
  startNumber?: number;
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
            {startNumber + i}.
          </span>
          <span className="font-semibold leading-none">
            {p.top} {p.symbol} {p.bottom} =
          </span>
          <span className="answer-line-sm flex-1" />
        </li>
      ))}
    </ol>
  );
}

export function StackedGrid({
  problems,
  startNumber = 1,
}: {
  problems: GridProblem[];
  startNumber?: number;
}) {
  return (
    <ol className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 print:grid-cols-4 print:gap-x-8 print:gap-y-6">
      {problems.map((p, i) => (
        <li key={i} className="flex gap-3" style={{ breakInside: "avoid" }}>
          <span className="num-tag w-7 shrink-0 pt-6 text-right text-xs text-ink-soft print:text-black">
            {startNumber + i}.
          </span>
          <div className="num-tag flex-1 text-right text-3xl font-semibold leading-snug print:text-2xl">
            {/* headroom above the top number for pencilled carry/borrow marks */}
            <div className="pt-5">{p.top}</div>
            <div className="flex items-end justify-between">
              <span className="pl-1 text-ink-soft print:text-black">{p.symbol}</span>
              <span>{p.bottom}</span>
            </div>
            <div className="mt-1 h-14 border-t-[2.5px] border-ink print:h-12 print:border-black" />
          </div>
        </li>
      ))}
    </ol>
  );
}
