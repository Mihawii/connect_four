import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "stripe not configured" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (err) {
    return NextResponse.json(
      { error: `signature verification failed: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 400 },
    );
  }

  const admin = getSupabaseAdmin();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};
    const userId = session.client_reference_id;
    if (admin && userId) {
      if (meta.kind === "subscription") {
        await admin.from("profiles").update({ is_pro: true }).eq("id", userId);
        await admin.from("subscriptions").upsert({
          user_id: userId,
          stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
          stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
          status: "active",
          plan: meta.plan ?? null,
        });
      } else if (meta.kind === "skin" && meta.sku) {
        await admin.from("entitlements").upsert({ user_id: userId, sku: meta.sku, source: "stripe" });
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    if (admin) {
      await admin.from("subscriptions").update({ status: "canceled" }).eq("stripe_subscription_id", sub.id);
    }
  }

  return NextResponse.json({ received: true });
}
