"use client";

import * as React from "react";
import { Check, Flame, Sparkles, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PRO_PLANS, SKINS, skinPrice, type SkinKind } from "@/lib/stripe/catalog";
import { cn } from "@/lib/utils";
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 text-center">
        <Badge variant="ember" className="mb-3">
          <Flame className="mr-1 size-3" /> No ads. Ever.
        </Badge>
        <h1 className="font-display text-4xl font-bold">Go Pro. Dress the fire.</h1>
        <p className="mt-2 text-muted-foreground">The game is free forever. This is how we keep the lights (and the board) on fire.</p>
      </div>

      <section className="mb-12 grid gap-4 md:grid-cols-3">
        {PRO_PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "relative flex flex-col p-6",
              plan.highlight && "border-[var(--ember)]/50 glow-ring-ember",
            )}
          >
            {plan.highlight && (
              <Badge variant="ember" className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                Most popular
              </Badge>
            )}
            <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold">{plan.price}</span>
              <span className="text-sm text-muted-foreground">{plan.cadence}</span>
            </div>
            <ul className="mt-4 flex-1 space-y-2 text-sm">
              {plan.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-[var(--ember)]" />
                  <span className="text-muted-foreground">{perk}</span>
                </li>
              ))}
            </ul>
            <Button
              variant={plan.highlight ? "ember" : "outline"}
              className="mt-6"
              disabled={pending === plan.id}
              onClick={() => checkout({ kind: "subscription", plan: plan.id }, plan.id)}
            >
              {pending === plan.id ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Upgrade to Pro
            </Button>
          </Card>
        ))}
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-bold">
          <ShoppingBag className="size-5 text-[var(--ember)]" /> Skins
        </h2>
        {kinds.map((kind) => {
          const items = SKINS.filter((s) => s.kind === kind);
          if (!items.length) return null;
          return (
            <div key={kind} className="mb-8">
              <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">{KIND_LABEL[kind]}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((skin) => (
                  <Card key={skin.sku} className="overflow-hidden">
                    <div className={cn("h-24 bg-gradient-to-br", skin.gradient)} />
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
