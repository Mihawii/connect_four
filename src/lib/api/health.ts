export function pingApiHealth(event: string) {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams({ event });
  void fetch(`/api/health?${params.toString()}`, { cache: "no-store" }).catch(() => {
    // Health pings are diagnostic only. Gameplay should not block on them.
  });
}
