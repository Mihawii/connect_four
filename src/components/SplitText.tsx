"use client";

import * as React from "react";
import { gsap } from "gsap";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
}

/** Per-character rise-and-reveal (GSAP), clipped by overflow-hidden wrappers. */
export function SplitText({
  text,
  className,
  delay = 0,
  duration = 0.9,
  stagger = 0.03,
}: SplitTextProps) {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chars = el.querySelectorAll<HTMLElement>("[data-char]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set(chars, { yPercent: 0, opacity: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, duration, ease: "power4.out", stagger, delay },
      );
    }, el);
    return () => ctx.revert();
  }, [text, delay, duration, stagger]);

  const words = text.split(" ");
  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap" aria-hidden>
          {word.split("").map((ch, ci) => (
            <span key={ci} className="inline-block overflow-hidden align-bottom leading-[1.05]">
              <span data-char className="inline-block">
                {ch}
              </span>
            </span>
          ))}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}
