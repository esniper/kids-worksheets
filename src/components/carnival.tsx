import type { CSSProperties } from "react";

export const carnivalColors = [
  "#ff3d6e",
  "#ffb627",
  "#39c172",
  "#3aa5f0",
  "#9b4dff",
  "#ff6fb5",
  "#ffd23f",
];

export function RainbowWord({
  word,
  baseRot = 0,
  startIndex = 0,
  colors = carnivalColors,
}: {
  word: string;
  baseRot?: number;
  startIndex?: number;
  colors?: string[];
}) {
  return (
    <>
      {word.split("").map((ch, i) => {
        const rot = baseRot + (i % 2 === 0 ? -2 : 3) + (i % 3 === 0 ? 1 : -1);
        const color = colors[(i + startIndex) % colors.length];
        return (
          <span
            key={i}
            className="inline-block"
            style={{
              transform: `rotate(${rot}deg) translateY(${(i % 2) * -4}px)`,
              color,
              textShadow:
                "3px 3px 0 rgba(0,0,0,1), -1px -1px 0 rgba(0,0,0,1), 1px -1px 0 rgba(0,0,0,1), -1px 1px 0 rgba(0,0,0,1), 1px 1px 0 rgba(0,0,0,1)",
              marginRight: ch === " " ? "0.4ch" : "-0.02em",
            }}
          >
            {ch === " " ? " " : ch}
          </span>
        );
      })}
    </>
  );
}

export function Burst({ label, color }: { label: string; color: string }) {
  return (
    <span className="relative inline-block">
      <svg
        viewBox="0 0 100 100"
        className="h-20 w-20"
        style={{ color }}
        aria-hidden
      >
        <polygon
          points="50,2 58,28 86,18 70,42 98,50 70,58 86,82 58,72 50,98 42,72 14,82 30,58 2,50 30,42 14,18 42,28"
          fill="currentColor"
          stroke="#1b1b1f"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="pointer-events-none absolute inset-0 flex -rotate-6 items-center justify-center text-lg uppercase leading-none"
        style={{ fontFamily: "var(--font-bagel)" }}
      >
        {label}
      </span>
    </span>
  );
}

export function Confetti() {
  const pieces = [
    { left: "6%", top: "12%", color: "#ff3d6e", rot: -20, size: 14 },
    { left: "18%", top: "70%", color: "#3aa5f0", rot: 30, size: 10 },
    { right: "22%", top: "8%", color: "#39c172", rot: 12, size: 16 },
    { right: "8%", top: "60%", color: "#9b4dff", rot: -8, size: 12 },
    { left: "45%", top: "30%", color: "#ffb627", rot: 24, size: 10 },
    { left: "30%", top: "92%", color: "#ff6fb5", rot: -36, size: 12 },
    { right: "30%", top: "85%", color: "#ffd23f", rot: 18, size: 14 },
    { left: "10%", top: "44%", color: "#9b4dff", rot: 60, size: 8 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute block"
          style={{
            left: p.left,
            right: p.right,
            top: p.top,
            width: p.size,
            height: p.size * 0.5,
            backgroundColor: p.color,
            transform: `rotate(${p.rot}deg)`,
            borderRadius: 2,
            border: "1.5px solid #1b1b1f",
          }}
        />
      ))}
      <Star
        className="wiggle-idle absolute left-[40%] top-[15%] h-8 w-8"
        color="#ffd23f"
      />
      <Star
        className="spin-slow absolute right-[18%] top-[42%] h-6 w-6"
        color="#ff3d6e"
      />
      <Star
        className="wiggle-idle absolute left-[12%] top-[80%] h-7 w-7"
        color="#3aa5f0"
      />
    </div>
  );
}

export function Star({
  className = "",
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 2 L13.4 9.2 L21 10.2 L15.2 14.4 L17 21.4 L12 17.2 L7 21.4 L8.8 14.4 L3 10.2 L10.6 9.2 Z"
        fill={color}
        stroke="#1b1b1f"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Sparkle({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path
        d="M12 1 L13.5 10.5 L23 12 L13.5 13.5 L12 23 L10.5 13.5 L1 12 L10.5 10.5 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Mascot({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <g transform="rotate(-12 60 60)">
        <rect
          x="36"
          y="14"
          width="48"
          height="78"
          rx="6"
          fill="#ffd23f"
          stroke="#1b1b1f"
          strokeWidth="3"
        />
        <rect
          x="36"
          y="14"
          width="48"
          height="14"
          fill="#ff6fb5"
          stroke="#1b1b1f"
          strokeWidth="3"
        />
        <polygon
          points="36,92 60,114 84,92"
          fill="#f6e3c5"
          stroke="#1b1b1f"
          strokeWidth="3"
        />
        <polygon points="52,103 60,114 68,103" fill="#1b1b1f" />
        <line
          x1="36"
          y1="22"
          x2="84"
          y2="22"
          stroke="#1b1b1f"
          strokeWidth="2"
        />
        <circle cx="50" cy="56" r="4" fill="#1b1b1f" />
        <circle cx="70" cy="56" r="4" fill="#1b1b1f" />
        <circle cx="51" cy="55" r="1.4" fill="#fff" />
        <circle cx="71" cy="55" r="1.4" fill="#fff" />
        <path
          d="M48 68 Q 60 78, 72 68"
          stroke="#1b1b1f"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="44" cy="66" r="3" fill="#ff6fb5" opacity="0.7" />
        <circle cx="76" cy="66" r="3" fill="#ff6fb5" opacity="0.7" />
      </g>
    </svg>
  );
}

export function CarnivalPill({
  children,
  rotate = "rotate-0",
  className = "",
}: {
  children: React.ReactNode;
  rotate?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-block rounded-full border-[3px] border-ink bg-paper px-5 py-1.5 text-base font-bold uppercase tracking-wide text-ink shadow-[4px_4px_0_var(--ink)] ${rotate} ${className}`}
      style={{ fontFamily: "var(--font-bagel)" }}
    >
      {children}
    </span>
  );
}
