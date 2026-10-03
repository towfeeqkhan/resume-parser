import { NextRequest, NextResponse } from "next/server";

import { resumeAgent, resumeSchema } from "@/mastra/agents/resume-agent";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, mediaType } = await req.json();

    if (
      !imageUrl ||
      typeof imageUrl !== "string" ||
      !mediaType ||
      typeof mediaType !== "string"
    ) {
      return NextResponse.json(
        {
          error: "Resume image URL and media type are required.",
        },
        { status: 400 },
      );
    }

    const response = await resumeAgent.generate(
      [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
Analyze this resume image and extract the resume information.

Extract only information that is actually visible in the image.
Do not invent or guess information.
If a field is not visible, return an empty string.
For education and experience, return an empty array when no
information is available.
              `.trim(),
            },
            {
              type: "file",
              data: imageUrl,
              mediaType: mediaType,
            },
          ],
        },
      ],
      {
        structuredOutput: {
          schema: resumeSchema,
          jsonPromptInjection: true,
        },
      },
    );

    const parsed = resumeSchema.safeParse(response.object);

    if (!parsed.success) {
      console.error("Invalid structured output:", parsed.error);

      return NextResponse.json(
        {
          error: "Model did not return a valid structured resume.",
        },
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
