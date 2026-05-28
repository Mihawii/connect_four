import { NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { analyzeMatch, heuristicReview } from "@/lib/coach/analyze";
import { COACH_SYSTEM_PROMPT, buildCoachUserPrompt, type Persona } from "@/lib/coach/prompt";

export const runtime = "nodejs";
export const maxDuration = 30;

const bodySchema = z.object({
  mode: z.enum(["classic", "inferno", "blitzInferno"]),
  cols: z.array(z.number().int().min(0).max(6)).max(120),
  forPlayer: z.union([z.literal(1), z.literal(2)]),
  persona: z.enum(["analyst", "hype", "drill", "zen"]).default("analyst"),
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const analysis = analyzeMatch(parsed.mode, parsed.cols);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      source: "heuristic",
      review: heuristicReview(analysis, parsed.forPlayer),
      stats: analysis.summaryStats,
    });
  }

  try {
    const client = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_COACH_MODEL ?? "claude-sonnet-4-6";
    // Prompt-cache the (stable) system prompt — saves ~90% on repeated reviews.
    const system = [
      { type: "text", text: COACH_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ] as unknown as Anthropic.MessageCreateParams["system"];
    const msg = await client.messages.create({
      model,
      max_tokens: 1024,
      system,
      messages: [
        { role: "user", content: buildCoachUserPrompt(analysis, parsed.forPlayer, parsed.persona as Persona) },
      ],
    });
    const text = msg.content.find((b) => b.type === "text");
    const raw = text && "text" in text ? text.text : "";
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    const review = jsonStart >= 0 ? JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) : heuristicReview(analysis, parsed.forPlayer);
    return NextResponse.json({ source: "claude", review, stats: analysis.summaryStats });
  } catch (err) {
    return NextResponse.json({
      source: "heuristic-fallback",
      review: heuristicReview(analysis, parsed.forPlayer),
      stats: analysis.summaryStats,
      note: err instanceof Error ? err.message : "coach error",
    });
  }
}
