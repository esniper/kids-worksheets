"use client";

// Shared answer-key bits for every printable worksheet: a toolbar toggle and
// a key that prints on its own trailing page. Entries are number + answer only.

export type KeyEntry = { n: number; answer: number };
export type KeySection = { title?: string; entries: KeyEntry[] };

export function KeyToggle({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className="group inline-flex -rotate-2 items-center gap-2 rounded-full border-[3px] border-ink px-4 py-2 text-sm font-bold uppercase tracking-wide text-ink shadow-[4px_4px_0_var(--ink)] transition-transform hover:rotate-0 hover:-translate-y-0.5"
      style={{
        fontFamily: "var(--font-bagel)",
        backgroundColor: on ? "#39c172" : "var(--paper)",
      }}
    >
      <span className="text-base leading-none" aria-hidden>
        {on ? "☑" : "☐"}
      </span>
      Answer key
    </button>
  );
}

export function AnswerKey({ sections }: { sections: KeySection[] }) {
  const total = sections.reduce((n, s) => n + s.entries.length, 0);
  if (total === 0) return null;

  return (
    <section
      className="mt-10 border-t-4 border-dashed border-ink pt-8 print:mt-0 print:border-0 print:pt-0"
      style={{ breakBefore: "page" }}
    >
      <header className="mb-4 flex items-baseline justify-between border-b-2 border-ink pb-2 print:border-b print:border-black">
        <span
          className="text-2xl uppercase tracking-tight print:font-[family-name:var(--font-fraunces)] print:text-xl print:normal-case"
          style={{ fontFamily: "var(--font-bagel)" }}
        >
          Answer Key 🔑
        </span>
        <span className="num-tag text-[10px] uppercase tracking-[0.22em] text-ink-soft print:text-black">
          for grading only
        </span>
      </header>

      {sections.map((section, i) => (
        <div key={i} className={i > 0 ? "mt-6" : ""}>
          {section.title && (
            <p className="num-tag mb-2 text-xs uppercase tracking-[0.18em] text-ink-soft print:text-black">
              {section.title}
            </p>
          )}
          <ol className="grid grid-cols-3 gap-x-6 gap-y-1.5 sm:grid-cols-4 lg:grid-cols-6 print:grid-cols-8 print:gap-x-4 print:gap-y-1">
            {section.entries.map((e) => (
              <li
                key={e.n}
                className="num-tag flex items-baseline gap-2 whitespace-nowrap text-sm print:text-[12px]"
                style={{ breakInside: "avoid" }}
              >
                <span className="w-6 shrink-0 text-right text-[10px] text-ink-soft print:text-black">
                  {e.n}.
                </span>
                <span className="font-semibold leading-none">{e.answer}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  );
}
