"use client";

// Toolbar field for pre-filling the student name on a sheet (and its answer
// key). Empty leaves the printed Name line blank for handwriting.
export function NameInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Name…"
      aria-label="Student name"
      className="w-40 -rotate-2 rounded-full border-[3px] border-ink bg-paper px-4 py-2 text-sm font-semibold text-ink shadow-[4px_4px_0_var(--ink)] outline-none transition-transform focus:rotate-0 focus:-translate-y-0.5"
      style={{ fontFamily: "var(--font-bagel)" }}
    />
  );
}
