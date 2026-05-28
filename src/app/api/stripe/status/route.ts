import { NextResponse } from "next/server";
import { isStripeEnabled } from "@/lib/stripe/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    enabled: isStripeEnabled,
    publishableKey: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()),
  });
}
