"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IconoirProvider } from "iconoir-react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
      }),
  );
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <IconoirProvider iconProps={{ strokeWidth: 2, width: "1em", height: "1em" }}>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--paper)",
              color: "var(--ink)",
              border: "1.5px solid var(--ink)",
              borderRadius: "0.5rem",
              boxShadow: "4px 4px 0 0 var(--ink)",
              fontFamily: "var(--font-space)",
            },
          }}
        />
      </IconoirProvider>
    </ThemeProvider>
  );
}
