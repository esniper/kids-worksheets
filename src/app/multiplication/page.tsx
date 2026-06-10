"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import {
  Confetti,
  Sparkle,
  Star,
} from "@/components/carnival";

const MIN_TABLE = 2;
const MAX_TABLE = 20;
const SPAN = MAX_TABLE - MIN_TABLE + 1;

type Handle = "floor" | "split" | "ceiling";
type State = { floor: number; split: number; ceiling: number };

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function applyHandle(prev: State, which: Handle, raw: number): State {
  let { floor, split, ceiling } = prev;
  if (which === "floor") {
    floor = clamp(Math.round(raw), MIN_TABLE, MAX_TABLE);
    if (floor > ceiling) ceiling = floor;
    if (floor - 1 > split) split = floor - 1;
  } else if (which === "ceiling") {
    ceiling = clamp(Math.round(raw), MIN_TABLE, MAX_TABLE);
    if (ceiling < floor) floor = ceiling;
    if (ceiling < split) split = ceiling;
  } else {
    split = clamp(Math.round(raw - 0.5), MIN_TABLE - 1, MAX_TABLE);
    if (split < floor - 1) floor = split + 1;
    if (split > ceiling) ceiling = split;
  }
  return { floor, split, ceiling };
}

export default function MultiplicationConfig() {
  const router = useRouter();

  const [state, setState] = useState<State>({ floor: 2, split: 7, ceiling: 12 });
  const { floor, split, ceiling } = state;

  const randomLen = Math.max(0, split - floor + 1);
  const inOrderLen = Math.max(0, ceiling - split);
  const randomCount = randomLen * 12;
  const inOrderCount = inOrderLen * 12;
  const total = randomCount + inOrderCount;
  const canSubmit = total > 0;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const params = new URLSearchParams();
    if (randomLen > 0) {
      params.set("rFrom", String(floor));
      params.set("rTo", String(split));
    }
    if (inOrderLen > 0) {
      params.set("ioFrom", String(split + 1));
      params.set("ioTo", String(ceiling));
    }
    router.push(`/multiplication/worksheet?${params.toString()}`);
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
            Step 1 of 2 · Multiplication
          </span>
          <h1
            className="text-[clamp(2.5rem,9vw,6rem)] uppercase leading-[0.95] tracking-tight"
            style={{ fontFamily: "var(--font-bagel)" }}
          >
            <span className="block">
              <CarnivalHeading
                word="PICK"
                colors={["#ff3d6e", "#ffb627", "#39c172", "#3aa5f0"]}
              />
            </span>
            <span className="block">
              <CarnivalHeading
                word="THE TABLES!"
                colors={[
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
                ]}
              />
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg font-semibold leading-snug text-ink">
            One slider. Drag the <Pill color="#ff3d6e">pink</Pill> end to set
            the floor, the middle to set where <Pill color="#ff3d6e">random</Pill>{" "}
            shuffled drills hand off to <Pill color="#3aa5f0">in-order</Pill>{" "}
            tables, and the <Pill color="#3aa5f0">blue</Pill> end to set the
            ceiling.
          </p>
        </section>

        <form onSubmit={onSubmit} className="mt-16">
          <TableRangeSlider state={state} onChange={setState} />

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Readout
              label="Random"
              color="#ff3d6e"
              empty={randomLen === 0}
              from={floor}
              to={split}
              tables={randomLen}
              problems={randomCount}
            />
            <Readout
              label="In-order"
              color="#3aa5f0"
              empty={inOrderLen === 0}
              from={split + 1}
              to={ceiling}
              tables={inOrderLen}
              problems={inOrderCount}
            />
          </div>

          <div className="mt-16 flex flex-col items-start gap-8 sm:flex-row sm:items-end sm:justify-between">
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
              <Star
                className="absolute -bottom-3 -right-3 h-6 w-6"
                color="#39c172"
              />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function TableRangeSlider({
  state,
  onChange,
}: {
  state: State;
  onChange: (next: State) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<Handle | null>(null);

  const { floor, split, ceiling } = state;

  // Each integer occupies one of SPAN equal cells.
  // Value v (continuous) maps to percent: (v - (MIN_TABLE - 0.5)) / SPAN * 100.
  const pctOf = (v: number) => ((v - (MIN_TABLE - 0.5)) / SPAN) * 100;

  // Floor & ceiling handles sit at integer centers; split sits between integers.
  const floorPct = pctOf(floor);
  const ceilingPct = pctOf(ceiling);
  const splitPct = pctOf(split + 0.5);

  const randomLeft = pctOf(floor - 0.5);
  const randomRight = pctOf(split + 0.5);
  const inOrderLeft = pctOf(split + 0.5);
  const inOrderRight = pctOf(ceiling + 0.5);

  const randomHasWidth = split >= floor;
  const inOrderHasWidth = ceiling > split;

  const valueAtClientX = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return MIN_TABLE;
    const rect = el.getBoundingClientRect();
    const frac = clamp((clientX - rect.left) / rect.width, 0, 1);
    return MIN_TABLE - 0.5 + frac * SPAN;
  }, []);

  const beginDrag = (which: Handle, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = which;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    onChange(applyHandle(state, which, valueAtClientX(e.clientX)));
  };

  const onMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    onChange(applyHandle(state, draggingRef.current, valueAtClientX(e.clientX)));
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const onTrackPointerDown = (e: React.PointerEvent) => {
    const v = valueAtClientX(e.clientX);
    // Snap nearest handle to the click position.
    const dFloor = Math.abs(v - floor);
    const dCeiling = Math.abs(v - ceiling);
    const dSplit = Math.abs(v - (split + 0.5));
    let nearest: Handle = "floor";
    let best = dFloor;
    if (dSplit < best) {
      nearest = "split";
      best = dSplit;
    }
    if (dCeiling < best) {
      nearest = "ceiling";
    }
    draggingRef.current = nearest;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    onChange(applyHandle(state, nearest, v));
  };

  const onKey = (which: Handle) => (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const delta = e.key === "ArrowLeft" ? -1 : 1;
    const current = which === "split" ? split + 0.5 : state[which];
    onChange(applyHandle(state, which, current + delta));
  };

  return (
    <div className="select-none">
      {/* Region labels */}
      <div className="relative mb-3 h-7">
        {randomHasWidth && (
          <RegionLabel
            text="Random"
            color="#ff3d6e"
            leftPct={(randomLeft + randomRight) / 2}
          />
        )}
        {inOrderHasWidth && (
          <RegionLabel
            text="In-order"
            color="#3aa5f0"
            leftPct={(inOrderLeft + inOrderRight) / 2}
          />
        )}
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        onPointerDown={onTrackPointerDown}
        onPointerMove={onMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative h-12 cursor-pointer border-[4px] border-ink bg-paper shadow-[6px_6px_0_var(--ink)]"
        style={{ touchAction: "none" }}
      >
        {/* Faint cell dividers */}
        {Array.from({ length: SPAN - 1 }, (_, i) => (
          <div
            key={i}
            className="pointer-events-none absolute top-0 bottom-0 w-px bg-ink/20"
            style={{ left: `${((i + 1) / SPAN) * 100}%` }}
            aria-hidden
          />
        ))}

        {/* Random band */}
        {randomHasWidth && (
          <div
            className="pointer-events-none absolute top-0 bottom-0 border-r-[3px] border-ink"
            style={{
              left: `${randomLeft}%`,
              width: `${randomRight - randomLeft}%`,
              backgroundColor: "#ff3d6e",
            }}
            aria-hidden
          />
        )}
        {/* In-order band */}
        {inOrderHasWidth && (
          <div
            className="pointer-events-none absolute top-0 bottom-0"
            style={{
              left: `${inOrderLeft}%`,
              width: `${inOrderRight - inOrderLeft}%`,
              backgroundColor: "#3aa5f0",
            }}
            aria-hidden
          />
        )}

        {/* Active region outer border (left/right edges via floor/ceiling) */}
        {/* The track itself has the full border; bands paint inside. */}

        {/* Handles */}
        <SliderHandle
          leftPct={floorPct}
          value={floor}
          valueMin={MIN_TABLE}
          valueMax={MAX_TABLE}
          color="#ff3d6e"
          ariaLabel="Floor"
          onPointerDown={(e) => beginDrag("floor", e)}
          onPointerMove={onMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKey("floor")}
        />
        <SliderHandle
          leftPct={splitPct}
          value={split}
          valueMin={MIN_TABLE - 1}
          valueMax={MAX_TABLE}
          color="#ffd23f"
          ariaLabel="Split"
          onPointerDown={(e) => beginDrag("split", e)}
          onPointerMove={onMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKey("split")}
        />
        <SliderHandle
          leftPct={ceilingPct}
          value={ceiling}
          valueMin={MIN_TABLE}
          valueMax={MAX_TABLE}
          color="#3aa5f0"
          ariaLabel="Ceiling"
          onPointerDown={(e) => beginDrag("ceiling", e)}
          onPointerMove={onMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKey("ceiling")}
        />
      </div>

      {/* Scale */}
      <div className="relative mt-2 h-6">
        {Array.from({ length: SPAN }, (_, i) => {
          const n = MIN_TABLE + i;
          const active = n >= floor && n <= ceiling;
          return (
            <span
              key={n}
              className={`absolute -translate-x-1/2 text-xs font-bold ${
                active ? "text-ink" : "text-ink/35"
              }`}
              style={{
                left: `${pctOf(n)}%`,
                fontFamily: "var(--font-bagel)",
              }}
            >
              {n}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function SliderHandle({
  leftPct,
  value,
  valueMin,
  valueMax,
  color,
  ariaLabel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onKeyDown,
}: {
  leftPct: number;
  value: number;
  valueMin: number;
  valueMax: number;
  color: string;
  ariaLabel: string;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  return (
    <button
      type="button"
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={valueMin}
      aria-valuemax={valueMax}
      aria-valuenow={value}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onKeyDown={onKeyDown}
      className="absolute top-1/2 z-10 flex h-14 w-10 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none flex-col items-center justify-center border-[4px] border-ink shadow-[3px_3px_0_var(--ink)] outline-none transition-transform focus-visible:-translate-y-[calc(50%+2px)] active:cursor-grabbing"
      style={{
        left: `${leftPct}%`,
        backgroundColor: color,
        fontFamily: "var(--font-bagel)",
      }}
    >
      <span className="text-xl leading-none text-ink">{value}</span>
    </button>
  );
}

function RegionLabel({
  text,
  color,
  leftPct,
}: {
  text: string;
  color: string;
  leftPct: number;
}) {
  return (
    <span
      className="absolute -translate-x-1/2 rounded-full border-[3px] border-ink px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-ink shadow-[2px_2px_0_var(--ink)]"
      style={{
        left: `${leftPct}%`,
        backgroundColor: color,
        fontFamily: "var(--font-bagel)",
      }}
    >
      {text}
    </span>
  );
}

function Readout({
  label,
  color,
  empty,
  from,
  to,
  tables,
  problems,
}: {
  label: string;
  color: string;
  empty: boolean;
  from: number;
  to: number;
  tables: number;
  problems: number;
}) {
  return (
    <div
      className={`relative border-[4px] border-ink p-4 shadow-[5px_5px_0_var(--ink)] transition-opacity ${
        empty ? "opacity-40" : ""
      }`}
      style={{ backgroundColor: color }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span
          className="text-2xl uppercase leading-none text-ink"
          style={{ fontFamily: "var(--font-bagel)" }}
        >
          {label}
        </span>
        <span
          className="rounded-full border-[2.5px] border-ink bg-paper px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink"
          style={{ fontFamily: "var(--font-bagel)" }}
        >
          {empty ? "Off" : `${from} → ${to}`}
        </span>
      </div>
      <p
        className="mt-2 text-sm font-bold uppercase tracking-wide text-ink"
        style={{ fontFamily: "var(--font-bagel)" }}
      >
        {empty
          ? "No tables in this section"
          : `${tables} ${tables === 1 ? "table" : "tables"} · ${problems} problems`}
      </p>
    </div>
  );
}

function CarnivalHeading({
  word,
  colors,
}: {
  word: string;
  colors: string[];
}) {
  return (
    <>
      {word.split("").map((ch, i) => {
        if (ch === " ") return <span key={i}> </span>;
        const rot = (i % 2 === 0 ? -2 : 3) + (i % 3 === 0 ? 1 : -1);
        const color = colors[i % colors.length];
        return (
          <span
            key={i}
            className="inline-block"
            style={{
              transform: `rotate(${rot}deg) translateY(${(i % 2) * -3}px)`,
              color,
              textShadow:
                "3px 3px 0 #1b1b1f, -1px -1px 0 #1b1b1f, 1px -1px 0 #1b1b1f, -1px 1px 0 #1b1b1f, 1px 1px 0 #1b1b1f",
              marginRight: "-0.02em",
            }}
          >
            {ch}
          </span>
        );
      })}
    </>
  );
}

function Pill({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <span
      className="inline-block rounded-full border-[2.5px] border-ink px-2 py-0.5 text-sm font-bold uppercase tracking-wide text-ink"
      style={{ backgroundColor: color, fontFamily: "var(--font-bagel)" }}
    >
      {children}
    </span>
  );
}
