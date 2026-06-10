"use client";

// Shared building blocks for the Step 1 config forms.

export function OptionRow({
  label,
  children,
  last = false,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 py-4 first:pt-0 ${
        last ? "" : "border-b-2 border-ink/15"
      }`}
    >
      <span
        className="w-36 shrink-0 text-sm font-bold uppercase tracking-wide text-ink"
        style={{ fontFamily: "var(--font-bagel)" }}
      >
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function Choice({
  selected,
  disabled = false,
  onClick,
  color,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full border-[3px] border-ink px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-ink transition-all ${
        selected
          ? "-translate-y-0.5 shadow-[3px_3px_0_var(--ink)]"
          : "bg-paper opacity-70 hover:opacity-100"
      } disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:opacity-30`}
      style={{
        fontFamily: "var(--font-bagel)",
        backgroundColor: selected ? color : undefined,
      }}
    >
      {children}
    </button>
  );
}
