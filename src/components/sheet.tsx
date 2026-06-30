// Shared printable-sheet chrome: the bordered header strip with title,
// meta line, and fill-in fields (Name / Date / Score / times).

// A header field. With `value` set it prints filled in (e.g. a pre-set name);
// otherwise it renders a blank line to write on.
export type SheetField = { label: string; suffix?: string; value?: string };

export function SheetHeader({
  tag,
  title,
  meta,
  fields,
}: {
  tag: string;
  title: string;
  meta: string;
  fields: SheetField[];
}) {
  return (
    <div className="mb-6 border-[3px] border-ink print:border print:border-black">
      <div className="flex items-stretch justify-between">
        <div className="flex-1 px-5 py-4">
          <p
            className="num-tag text-[10px] uppercase tracking-[0.22em] text-ink-soft print:text-black"
            style={{ letterSpacing: "0.22em" }}
          >
            {tag}
          </p>
          <h2
            className="mt-1 text-3xl uppercase leading-tight tracking-tight sm:text-4xl print:font-[family-name:var(--font-fraunces)] print:normal-case"
            style={{ fontFamily: "var(--font-bagel)" }}
          >
            {title}
          </h2>
          <p className="num-tag mt-1 text-xs uppercase tracking-[0.16em] text-ink-soft print:text-black">
            {meta}
          </p>
        </div>
        <div className="grid w-72 shrink-0 grid-cols-1 divide-y divide-ink/40 border-l border-ink/40 text-xs print:border-black print:divide-black">
          {fields.map((field) => (
            <div key={field.label} className="flex items-center gap-3 px-4 py-2">
              <span className="num-tag uppercase tracking-[0.18em] text-ink-soft print:text-black">
                {field.label}
              </span>
              <span className="flex-1 border-b border-ink/70 print:border-black">
                {field.value && (
                  <span className="px-1 font-semibold text-ink print:text-black">
                    {field.value}
                  </span>
                )}
              </span>
              {field.suffix && (
                <span className="num-tag text-ink-soft print:text-black">
                  {field.suffix}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
