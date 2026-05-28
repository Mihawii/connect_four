"use client";

import * as React from "react";
import { Flame, ShoppingBag, Loader2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Component as SquishyPricing, type SquishyPricingPlan } from "@/components/ui/squishy-pricing";
import { PRO_PLANS, SKINS, skinPrice, type SkinKind } from "@/lib/stripe/catalog";
import { toast } from "sonner";

const KIND_LABEL: Record<SkinKind, string> = {
  board: "Boards",
  disc: "Disc sets",
  burnfx: "Burn FX",
  sfx: "Sound packs",
  bundle: "Bundles",
};

export default function StorePage() {
  const [pending, setPending] = React.useState<string | null>(null);

  const checkout = async (body: Record<string, unknown>, id: string) => {
    setPending(id);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error("Checkout unavailable", { description: data.error ?? "Set up Stripe to enable purchases." });
    } catch {
      toast.error("Checkout failed");
    } finally {
      setPending(null);
    }
  };

  const kinds: SkinKind[] = ["board", "disc", "burnfx", "sfx", "bundle"];
  const pricingPlans: SquishyPricingPlan[] = PRO_PLANS.map((plan) => ({
    id: plan.id,
    label: plan.name.replace("Pro ", ""),
    monthlyPrice: plan.price.replace("$", ""),
    cadence: plan.cadence === "once" ? "Once" : plan.cadence.replace("/", ""),
    description: plan.perks.slice(0, 3).join(". "),
    cta: plan.id === "lifetime" ? "Go founder" : "Upgrade",
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-4 text-center">
        <Badge variant="ember" className="mb-3">
          <Flame className="mr-1 size-3" /> No ads. Ever.
        </Badge>
        <h1 className="font-display text-4xl font-bold">Go Pro. Dress the fire.</h1>
      </div>

      <SquishyPricing
        plans={pricingPlans}
        pendingId={pending}
        onSelectPlan={(plan) => checkout({ kind: "subscription", plan: plan.id }, plan.id)}
      />

      <section className="mt-4">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b-[1.5px] border-ink pb-4">
          <div>
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--ember)]">
              <ShoppingBag className="size-4" /> Skin market
            </p>
            <h2 className="font-display text-2xl font-bold">Change the board, discs, burn, and sound.</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Cosmetic only. Ranked stays fair, the board gets louder.
          </p>
        </div>

        {kinds.map((kind) => {
          const items = SKINS.filter((s) => s.kind === kind);
          if (!items.length) return null;
          return (
            <div key={kind} className="grid gap-3 border-b border-border py-5 last:border-b-0 md:grid-cols-[11rem_minmax(0,1fr)]">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{KIND_LABEL[kind]}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {kind === "bundle" ? "Best value sets." : kind === "burnfx" ? "The moment a disc expires." : "Small changes, big table presence."}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((skin) => (
                  <Card key={skin.sku} className="group overflow-hidden border-[1.5px] border-ink bg-[var(--paper-2)] transition-transform duration-200 hover:-translate-y-0.5">
                    <div className="relative h-28 border-b-[1.5px] border-ink" style={{ background: skin.color }}>
                      <div className="absolute inset-0 paper-grain opacity-15" />
                      <span className="absolute bottom-3 left-3 size-8 rounded-full border-[1.5px] border-ink bg-[var(--ember)] transition-transform duration-200 group-hover:translate-x-1" />
                      <span className="absolute bottom-3 left-12 size-8 rounded-full border-[1.5px] border-ink bg-[var(--gold)] transition-transform duration-200 group-hover:translate-x-2" />
                      <span className="absolute right-3 top-3 rounded-md border border-ink bg-[var(--paper)] px-2 py-1 font-mono text-[10px] uppercase">
                        {skin.kind}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{skin.name}</h4>
                        <span className="font-mono text-sm text-[var(--ember)]">{skinPrice(skin.priceCents)}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{skin.description}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                        disabled={pending === skin.sku}
                        onClick={() => checkout({ kind: "skin", sku: skin.sku }, skin.sku)}
                      >
                        {pending === skin.sku ? <Loader2 className="size-4 animate-spin" /> : null}
                        Buy
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
