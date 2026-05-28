"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

/** Applies the 3D board palette (`#2f271f`) on every route except the landing hero. */
export function BoardTheme() {
  const pathname = usePathname();

  React.useEffect(() => {
    const onBoard = pathname !== "/";
    document.documentElement.toggleAttribute("data-board-theme", onBoard);
    return () => {
      document.documentElement.removeAttribute("data-board-theme");
    };
  }, [pathname]);

  return null;
}
