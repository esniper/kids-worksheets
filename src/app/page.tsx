import Link from "next/link";
import {
  Confetti,
  Mascot,
  RainbowWord,
  Burst,
  Sparkle,
  carnivalColors,
} from "@/components/carnival";

type Sheet = {
  idx: string;
  title: string;
  blurb: string;
  href?: string;
  status: "ready" | "soon";
  meta: string;
};

const sheets: Sheet[] = [
  {
    idx: "01",
    title: "Multiplication",
    blurb:
      "Tables 2 through 20. Mix in-order drills with shuffled problems on tables they've mastered.",
    href: "/multiplication",
    status: "ready",
    meta: "Two-step setup · printable",
  },
  {
    idx: "02",
    title: "Addition",
    blurb:
      "Timed speed drills on the facts, or big stacked sums with or without carrying.",
    href: "/addition",
    status: "ready",
    meta: "Two-step setup · printable",
  },
  {
    idx: "03",
    title: "Subtraction",
    blurb:
      "Race-the-clock fact drills, or stacked take-aways with or without borrowing.",
    href: "/subtraction",
    status: "ready",
    meta: "Two-step setup · printable",
  },
  {
    idx: "04",
    title: "Mix It Up",
    blurb:
      "One sheet, every trick: shuffled speed-drill facts and big stacked numbers from the operations you pick.",
    href: "/mix",
    status: "ready",
    meta: "Two-step setup · printable",
  },
  {
    idx: "05",
    title: "Division",
    blurb:
      "Long division and fact families. Pairs neatly with the multiplication sheet.",
    status: "soon",
    meta: "In the works",
  },
  {
    idx: "06",
    title: "Fractions",
    blurb: "Visual fractions, equivalents, and adding with common denominators.",
    status: "soon",
    meta: "Penciled in",
  },
];

const cardStyles: Record<
  string,
  { bg: string; ring: string; tilt: string; delay: string }
> = {
  "01": { bg: "#ff3d6e", ring: "#9b4dff", tilt: "-rotate-2", delay: "0s" },
  "02": { bg: "#ffb627", ring: "#3aa5f0", tilt: "rotate-2", delay: "0.08s" },
  "03": { bg: "#39c172", ring: "#ff6fb5", tilt: "-rotate-1", delay: "0.16s" },
  "04": { bg: "#9b4dff", ring: "#39c172", tilt: "rotate-1", delay: "0.24s" },
  "05": { bg: "#3aa5f0", ring: "#ffd23f", tilt: "rotate-3", delay: "0.32s" },
  "06": { bg: "#ff6fb5", ring: "#ffb627", tilt: "-rotate-2", delay: "0.4s" },
};

export default function Home() {
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

      <div className="relative mx-auto w-full max-w-5xl px-6 sm:px-10">
        <header className="flex items-baseline justify-between">
          <span
            className="text-3xl"
            style={{ fontFamily: "var(--font-bagel)", color: "#ff3d6e" }}
          >
            FOOLSCAP!
          </span>
          <span
            className="rounded-full border-[3px] border-ink bg-paper px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-ink shadow-[3px_3px_0_var(--ink)]"
            style={{ fontFamily: "var(--font-bagel)" }}
          >
            Vol. 01
          </span>
        </header>

        <section className="relative mt-20 sm:mt-28">
          <Mascot className="absolute -right-2 top-2 hidden h-40 w-40 sm:block float-anim" />

          <p
            className="mb-6 inline-block -rotate-2 rounded-full border-[3px] border-ink bg-paper px-5 py-1.5 text-base font-bold uppercase tracking-wide text-ink shadow-[4px_4px_0_var(--ink)]"
            style={{ fontFamily: "var(--font-bagel)" }}
          >
            ✨ Print &amp; play ✨
          </p>

          <h1
            className="text-[clamp(3rem,11vw,8.5rem)] uppercase leading-[0.95] tracking-tight"
            style={{ fontFamily: "var(--font-bagel)" }}
          >
            <span className="block">
              <RainbowWord word="PICK" baseRot={-2} />
            </span>
            <span className="block">
              <RainbowWord word="A" baseRot={3} startIndex={4} />
            </span>
            <span className="block">
              <RainbowWord
                word="WORKSHEET!"
                baseRot={-1}
                startIndex={5}
                colors={carnivalColors}
              />
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg font-semibold leading-snug text-ink">
            A little library of practice sheets. Big chunky letters, lots of
            color, and zero bugs — just printable pages your kid can actually
            do with a pencil.
          </p>
        </section>

        <section className="relative mt-24 sm:mt-32">
          <div className="mb-10 flex items-baseline justify-between">
            <h2
              className="text-3xl uppercase"
              style={{ fontFamily: "var(--font-bagel)", color: "#9b4dff" }}
            >
              The Sheets!
            </h2>
            <div
              className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-paper px-3 py-1 text-sm font-bold uppercase tracking-wide shadow-[3px_3px_0_var(--ink)]"
              style={{ fontFamily: "var(--font-bagel)" }}
            >
              <Sparkle className="h-4 w-4" style={{ color: "#ffb627" }} />
              {sheets.filter((s) => s.status === "ready").length} of{" "}
              {sheets.length}
            </div>
          </div>

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
            {sheets.map((sheet) => (
              <CrayonCard key={sheet.idx} sheet={sheet} />
            ))}
          </ul>
        </section>

        <footer className="mt-24 flex flex-wrap items-center justify-between gap-4">
          <span
            className="rounded-full border-[3px] border-ink bg-paper px-4 py-2 text-sm font-bold uppercase tracking-wide text-ink shadow-[3px_3px_0_var(--ink)]"
            style={{ fontFamily: "var(--font-bagel)" }}
          >
            Print on letter · pencil ready ✏︎
          </span>
          <span
            className="text-2xl"
            style={{ fontFamily: "var(--font-bagel)", color: "#ff3d6e" }}
          >
            Yay!
          </span>
        </footer>
      </div>
    </main>
  );
}

function CrayonCard({ sheet }: { sheet: Sheet }) {
  const s = cardStyles[sheet.idx] ?? cardStyles["01"];
  const inner = (
    <div
      className={`pop-in relative border-[4px] border-ink p-6 shadow-[8px_8px_0_var(--ink)] transition-transform group-hover:-translate-y-1 group-hover:rotate-0 ${s.tilt}`}
      style={
        {
          backgroundColor: s.bg,
          ["--pop-rot" as string]: s.tilt.includes("-rotate-")
            ? `-${s.tilt.replace(/[^\d]/g, "")}deg`
            : `${s.tilt.replace(/[^\d]/g, "")}deg`,
          animationDelay: s.delay,
        } as React.CSSProperties
      }
    >
      <span
        className="absolute -left-[4px] -right-[4px] -top-[4px] block h-3 border-[4px] border-ink"
        style={{ backgroundColor: s.ring }}
        aria-hidden
      />

      <div className="flex items-start justify-between">
        <span
          className="text-4xl text-ink"
          style={{ fontFamily: "var(--font-bagel)" }}
        >
          {sheet.idx}
        </span>
        {sheet.status === "ready" ? (
          <Burst label="Ready!" color={s.ring} />
        ) : (
          <span
            className="rotate-3 rounded-full border-[3px] border-ink bg-paper px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink shadow-[2px_2px_0_var(--ink)]"
            style={{ fontFamily: "var(--font-bagel)" }}
          >
            Soon
          </span>
        )}
      </div>

      <h3
        className="mt-4 text-4xl uppercase leading-none tracking-tight text-ink sm:text-5xl"
        style={{ fontFamily: "var(--font-bagel)" }}
      >
        {sheet.title}
      </h3>
      <p className="mt-3 text-[15px] font-semibold leading-snug text-ink">
        {sheet.blurb}
      </p>

      {sheet.status === "ready" && (
        <div className="mt-6 flex items-center justify-between">
          <span
            className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink bg-paper px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink shadow-[2px_2px_0_var(--ink)]"
            style={{ fontFamily: "var(--font-bagel)" }}
          >
            {sheet.meta}
          </span>
          <span
            className="text-3xl text-ink transition-transform group-hover:translate-x-1"
            style={{ fontFamily: "var(--font-bagel)" }}
            aria-hidden
          >
            →
          </span>
        </div>
      )}
    </div>
  );

  if (sheet.status === "ready" && sheet.href) {
    return (
      <li>
        <Link href={sheet.href} className="group block">
          {inner}
        </Link>
      </li>
    );
  }
  return <li className="opacity-80">{inner}</li>;
}
