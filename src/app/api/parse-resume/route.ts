import { NextRequest, NextResponse } from "next/server";

import { resumeAgent, resumeSchema } from "@/mastra/agents/resume-agent";

export async function POST(req: NextRequest) {
  try {
    const { resumeText } = await req.json();

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json(
        { error: "Resume text is required." },
        { status: 400 },
      );
    }

    const response = await resumeAgent.generate(resumeText, {
      structuredOutput: {
        schema: resumeSchema,
        // The gateway does not honor native `response_format`/`text.format`
        // JSON schemas, so ask for JSON via prompt injection instead.
        jsonPromptInjection: true,
      },
    });

    const parsed = resumeSchema.safeParse(response.object);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Model did not return a valid structured resume." },
        { status: 502 },
      );
    }

    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error("Resume parsing error:", error);

    return NextResponse.json(
      { error: "Failed to parse resume." },
      { status: 500 },
    );
  }
}
