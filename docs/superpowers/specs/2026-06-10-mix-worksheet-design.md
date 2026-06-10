# Mixed Worksheet ("Mix It Up")

Approved 2026-06-10. A fourth sheet that combines speed-drill facts and
big stacked numbers across user-selected operations on a single printable
worksheet.

## Entry point and routes

- Home page gets a new "Mix It Up" card as sheet 04 (Division and
  Fractions shift to 05/06), linking to `/mix`.
- `/mix` — Step 1 config page, same carnival styling and two-step flow as
  the existing sheets.
- `/mix/worksheet?…` — Step 2 printable sheet.

## Config page (`/mix`)

Two independently toggleable sections, each driven by op chips:

1. **Speed Drill** — multi-select chips for Addition, Subtraction,
   Multiplication. No chips selected = section off.
   - Addition/subtraction contribute their existing fact-family pools
     (no extra options, same as the standalone drills).
   - When Multiplication is selected: a table-range option (From/To,
     tables 2–12; each fact is `a × b` with b in 1–12). Capped at 12
     (not the standalone page's 20) to keep mixed drill rows uniform.
   - Count chips: 12 / 24 / 36 / 60 (every option divides evenly across
     2 or 3 ops).
2. **Big Numbers** — multi-select chips for Addition, Subtraction
   (multiplication has no stacked mode). No chips selected = section off.
   - Per selected op, its existing option rows: digits + carrying for
     addition (operands interchangeable), digits + borrowing for
     subtraction (top ≥ bottom).
   - Count chips: 12 / 20 / 30 (all even).

Generate! is disabled unless at least one section has an op selected.

Example URL:
`/mix/worksheet?drill=add,sub,mul&dcount=24&from=2&to=12&big=add,sub&bcount=20&ax=2&ay=1&acarry=mix&sx=3&sy=2&sborrow=no`

## Worksheet (`/mix/worksheet`)

- Shared `SheetHeader`: tag "Foolscap · No. 04", title "Mixed Worksheet",
  meta line summarizing both sections; Name/Date/Score fields (Start/End
  time fields when the drill section is on, matching the standalone drill).
- **Speed Drill section**: the count is split evenly across enabled ops,
  facts drawn from each op's shuffled pool, then shuffled together so
  `7 + 8`, `12 − 5`, `6 × 4` interleave. If a multiplication range is too
  small for its share, facts repeat (cycled shuffled pool).
- **Big Numbers section**: count split evenly across enabled ops, problems
  from `buildBigNumbers` per op, shuffled together; each stacked problem
  renders its own + / − symbol.
- Continuous problem numbering across sections; one Score line for the
  total. Seed state + Re-shuffle + Print toolbar identical to existing
  sheets.

## Code structure

- `src/lib/arithmetic.ts`: refactor the drill fact pool out of
  `buildDrill`; add a multiplication fact pool; new `buildMixedDrill(ops,
  count, tables, seed)` and `buildMixedBig(ops, count, optsPerOp, seed)`
  returning op-tagged problems (`{ op, top, bottom }`). `DrillOp = "add" |
  "sub" | "mul"` stays separate from the big-numbers `Op`.
- `src/lib/sheet-config.ts`: `parseMixParams` with the same clamping /
  junk-tolerance style as `parseWorksheetParams` (digit clamps, sub
  borrow coercion, counts restricted to the chip values, table range
  clamped to 2–12 and ordered).
- Shared UI: extract `OptionRow`/`Choice` from `ConfigView.tsx` into a
  shared module; generalize the drill and stacked grids to accept a
  per-problem symbol so both the per-op sheets and the mix sheet use them.
- New `src/components/mix/MixConfigView.tsx`, `MixWorksheetView.tsx`,
  routes `src/app/mix/page.tsx` and `src/app/mix/worksheet/page.tsx`.

## Decisions made along the way

- Even per-op count splits (no weighting).
- Mix drill table range capped at 2–12.
- All generation TDD'd in lib tests; UI verified end-to-end with
  Playwright against the dev server.
