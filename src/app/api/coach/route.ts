import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
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

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "coach",
    analysisEngine: "ready",
    source: process.env.OPENAI_API_KEY ? "openai" : "heuristic",
  });
}

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const analysis = analyzeMatch(parsed.mode, parsed.cols);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      source: "heuristic",
      review: heuristicReview(analysis, parsed.forPlayer),
      stats: analysis.summaryStats,
    });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const model = process.env.OPENAI_COACH_MODEL ?? "gpt-4o-mini";
    
    const response = await openai.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: COACH_SYSTEM_PROMPT },
        { role: "user", content: buildCoachUserPrompt(analysis, parsed.forPlayer, parsed.persona as Persona) }
      ],
      max_tokens: 1024,
    });

    const raw = response.choices[0]?.message.content || "";
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    const review = jsonStart >= 0 ? JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) : heuristicReview(analysis, parsed.forPlayer);
    
    return NextResponse.json({ source: "openai", review, stats: analysis.summaryStats });
  } catch (err) {
    return NextResponse.json({
      source: "heuristic-fallback",
      review: heuristicReview(analysis, parsed.forPlayer),
      stats: analysis.summaryStats,
      note: err instanceof Error ? err.message : "coach error",
    });
  }
}
