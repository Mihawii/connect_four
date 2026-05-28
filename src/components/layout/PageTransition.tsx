"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(2px)" }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(1px)" }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-full will-change-transform"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
