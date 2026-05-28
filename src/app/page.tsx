"use client";

import * as React from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { InfernoBadge } from "@/components/InfernoBadge";

const HEADER_ROWS = ["Drop fast,", "Burn faster."];
const EMOJI_SIZES = [120, 160, 200, 240];
const MOUSE_DISTANCE = 280;
const EMOJI_WAIT = 450;

function splitChars(text: string) {
  return text.split("").map((ch, i) => (
    <span key={i} className="char">
      {ch === " " ? "\u00A0" : ch}
    </span>
  ));
}

export default function HomePage() {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const preloaderRef = React.useRef<HTMLDivElement>(null);
  const loaderRef = React.useRef<HTMLDivElement>(null);
  const badgeRef = React.useRef<HTMLDivElement>(null);
  const emojiLayerRef = React.useRef<HTMLDivElement>(null);
  const isLoading = React.useRef(true);

  React.useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const initPage = () => {
        isLoading.current = false;
        const tl = gsap.timeline();
        tl.to(".header-row .char", {
          yPercent: 0,
          duration: 1,
          ease: "power4.out",
          stagger: { amount: 0.3 },
        }, 0)
          .to(".hero-sub", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.5)
          .to(".hero-cta", { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.7)
          .to(badgeRef.current, { scale: 1, opacity: 1, duration: 1.2, ease: "power4.out" }, 0.2)
          .to(badgeRef.current, { rotation: 360, duration: 40, ease: "none", repeat: -1 }, 0.2);
      };

      gsap.set(".header-row .char", { yPercent: 130 });
      gsap.set(".hero-sub", { opacity: 0, y: 20 });
      gsap.set(".hero-cta", { opacity: 0, y: 20 });
      gsap.set(badgeRef.current, { scale: 0.85, opacity: 0 });

      if (reduce) {
        gsap.set(preloaderRef.current, { display: "none" });
        gsap.set(".header-row .char", { yPercent: 0 });
        gsap.set(".hero-sub", { opacity: 1, y: 0 });
        gsap.set(".hero-cta", { opacity: 1, y: 0 });
        gsap.set(badgeRef.current, { scale: 1, opacity: 1 });
        return;
      }

      gsap.to(preloaderRef.current, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration: 1,
        delay: 1.6,
        ease: "power4.inOut",
      });

      gsap.to(loaderRef.current, {
        rotation: "+=180",
        duration: 0.7,
        delay: 0.2,
        repeat: 1,
        ease: "power4.inOut",
        onComplete: () => {
          gsap.to(loaderRef.current, {
            scale: 0,
            duration: 0.5,
            ease: "power4.inOut",
            onComplete: initPage,
          });
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  /* ── Emoji mouse trail during preloader ──────────────────────────────── */
  React.useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let lastEmoji = 0;
    const createEmoji = (mx: number, my: number) => {
      const layer = emojiLayerRef.current;
      if (!layer) return Date.now();
      const size = EMOJI_SIZES[Math.floor(Math.random() * EMOJI_SIZES.length)];
      const variant = Math.floor(Math.random() * 4) + 1;
      const el = document.createElement("div");
      el.style.cssText = `position:absolute;width:${size}px;height:${size}px;left:${mx - size / 2}px;top:${
        my - size / 2
      }px;background-image:url(/intro/emoji-${variant}.png);background-size:cover;background-position:50% 50%;border-radius:100%;pointer-events:none;will-change:transform;`;
      layer.appendChild(el);
      const rot = Math.random() > 0.5 ? 90 : -90;
      const now = Date.now();
      const delayFromLast = Math.max(0, 200 - (now - lastEmoji)) / 1000;
      gsap.set(el, { scale: 0, rotation: rot });
      const tl = gsap.timeline();
      tl.to(el, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.75)" }).to(el, {
        y: window.innerHeight + size,
        rotation: rot,
        duration: 0.5,
        ease: "power2.in",
        delay: EMOJI_WAIT / 1000 + delayFromLast,
        onComplete: () => el.remove(),
      });
      return now;
    };
    const onMove = (e: MouseEvent) => {
      if (!isLoading.current) return;
      if (Math.hypot(e.clientX - lastX, e.clientY - lastY) > MOUSE_DISTANCE) {
        lastEmoji = createEmoji(e.clientX, e.clientY);
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={rootRef} className="intro">
      <div ref={preloaderRef} className="preloader">
        <div ref={loaderRef} className="loader">
          <div className="spinner" />
        </div>
      </div>

      <div ref={emojiLayerRef} className="emojis" />

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="header">
              {HEADER_ROWS.map((row, i) => (
                <div key={i} className="header-row">
                  <h1>{splitChars(row)}</h1>
                </div>
              ))}
            </div>

            <p className="hero-sub">
              Every disc burns after ten of your turns.
              <br />
              Blitz Connect Four — where time is fire.
            </p>

            <Link href="/play" className="hero-cta">
              Play now <span className="arrow">→</span>
            </Link>
          </div>

          <div ref={badgeRef} className="hero-right">
            <InfernoBadge size={400} className="badge" />
          </div>
        </div>
      </section>

      <style jsx>{`
        .intro {
          position: relative;
          width: 100%;
          height: 100svh;
          overflow: hidden;
        }

        /* ── Preloader ─────────────────────────────────── */
        .preloader {
          position: fixed;
          inset: 0;
          background: var(--coal);
          display: flex;
          justify-content: center;
          align-items: center;
          clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
          will-change: clip-path;
          z-index: 10;
        }
        .loader {
          will-change: transform;
        }
        .spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(255, 255, 255, 0.15);
          border-top-color: var(--ember);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .emojis {
          position: fixed;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 11;
        }

        /* ── Hero ──────────────────────────────────────── */
        .hero {
          width: 100%;
          height: 100svh;
          background: var(--paper);
          display: flex;
          align-items: center;
        }
        .hero-inner {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem 4rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 4rem;
        }

        /* ── Left: copy ────────────────────────────────── */
        .hero-left {
          flex: 1 1 55%;
          min-width: 0;
        }
        .header {
          display: flex;
          flex-direction: column;
          gap: 0.1em;
        }
        .header-row {
          overflow: hidden;
          padding-top: 0.12em;
        }
        .header-row :global(h1) {
          font-family: var(--font-bricolage);
          font-size: clamp(2.8rem, 6.5vw, 6rem);
          font-weight: 800;
          line-height: 1.02;
          letter-spacing: -0.035em;
          color: var(--ink);
        }
        .header-row :global(.char) {
          display: inline-block;
        }
        .hero-sub {
          margin-top: 1.8rem;
          font-family: var(--font-body);
          font-size: clamp(0.95rem, 1.2vw, 1.1rem);
          line-height: 1.65;
          color: var(--ink-soft);
          max-width: 380px;
        }
        .hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.6em;
          margin-top: 2.2rem;
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 15px;
          color: var(--primary-foreground);
          background: var(--ember);
          border: 2px solid var(--ink);
          border-radius: 0.5rem;
          padding: 0.8em 1.7em;
          box-shadow: 4px 4px 0 0 var(--ink);
          text-decoration: none;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .hero-cta:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 0 var(--ink);
        }
        .hero-cta:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 0 var(--ink);
        }
        .arrow {
          transition: transform 0.2s;
        }
        .hero-cta:hover .arrow {
          transform: translateX(4px);
        }

        /* ── Right: badge ──────────────────────────────── */
        .hero-right {
          flex: 0 0 auto;
          width: clamp(180px, 26vw, 360px);
          aspect-ratio: 1;
          will-change: transform;
        }
        .hero-right :global(.badge) {
          width: 100%;
          height: 100%;
        }

        /* ── Responsive ────────────────────────────────── */
        @media (max-width: 768px) {
          .hero-inner {
            flex-direction: column-reverse;
            padding: 6rem 1.5rem 3rem;
            text-align: center;
            gap: 2rem;
          }
          .hero-left {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-sub {
            max-width: none;
          }
          .hero-right {
            width: 140px;
          }
        }
      `}</style>
    </div>
  );
}
