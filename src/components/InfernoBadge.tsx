import * as React from "react";

/** Circular brand badge: ink ring of repeating wordmark text around an ember disc with a flame. */
export function InfernoBadge({
  size = 160,
  className,
  label = "INFERNO ✦ BLITZ CONNECT FOUR ✦ ",
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="Inferno"
    >
      <defs>
        <path id={`ring-${id}`} d="M100,100 m -82,0 a 82,82 0 1,1 164,0 a 82,82 0 1,1 -164,0" />
      </defs>
      <circle cx="100" cy="100" r="98" fill="none" stroke="var(--ink)" strokeWidth="2" />
      <circle cx="100" cy="100" r="62" fill="none" stroke="var(--ink)" strokeWidth="2" />
      <text
        fontFamily="var(--font-geist-mono), monospace"
        fontSize="13"
        fontWeight={700}
        letterSpacing="3"
        fill="var(--ink)"
      >
        <textPath href={`#ring-${id}`} startOffset="0">
          {label}
        </textPath>
      </text>
      <circle cx="100" cy="100" r="54" fill="var(--ember)" />
      {/* flame */}
      <path
        d="M100 64 C 100 82, 120 88, 116 110 C 113 127, 102 132, 100 146 C 98 132, 86 127, 84 110 C 80 88, 100 82, 100 64 Z"
        fill="var(--ink)"
      />
      <path
        d="M100 92 C 100 100, 108 103, 106 113 C 104 121, 100 123, 100 130 C 100 123, 95 121, 94 113 C 92 103, 100 100, 100 92 Z"
        fill="var(--ember)"
      />
    </svg>
  );
}
