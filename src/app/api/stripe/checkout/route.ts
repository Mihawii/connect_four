import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe/server";
import { PRO_PLANS, SKINS } from "@/lib/stripe/catalog";

export const runtime = "nodejs";

const schema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("subscription"), plan: z.enum(["monthly", "yearly", "lifetime"]) }),
  z.object({ kind: z.literal("skin"), sku: z.string() }),
]);

export async function POST(req: Request) {
  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured. Set STRIPE_SECRET_KEY to enable checkout." },
      { status: 503 },
    );
  }

  let body;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  try {
    if (body.kind === "subscription") {
      const plan = PRO_PLANS.find((p) => p.id === body.plan)!;
      const priceId = process.env[plan.envPriceKey];
      if (!priceId) {
        return NextResponse.json(
          { error: `Missing ${plan.envPriceKey}. Create the price in Stripe and add it to .env.local.` },
          { status: 503 },
        );
      }
      const session = await stripe.checkout.sessions.create({
        mode: plan.id === "lifetime" ? "payment" : "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl}/account?upgraded=1`,
        cancel_url: `${appUrl}/store`,
        metadata: { kind: "subscription", plan: plan.id },
      });
      return NextResponse.json({ url: session.url });
    }

    const skin = SKINS.find((s) => s.sku === body.sku);
    if (!skin) return NextResponse.json({ error: "unknown sku" }, { status: 400 });
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: skin.priceCents,
            product_data: { name: `Inferno — ${skin.name}`, description: skin.description },
          },
        },
      ],
      success_url: `${appUrl}/store?purchased=${skin.sku}`,
      cancel_url: `${appUrl}/store`,
      metadata: { kind: "skin", sku: skin.sku },
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "checkout failed" },
      { status: 500 },
    );
  }
}
