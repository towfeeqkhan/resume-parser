import { Agent } from "@mastra/core/agent";
import { z } from "zod";

import { tokenHarborVision } from "../models";

export const resumeSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),

  summary: z.string(),

  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.string(),
    }),
  ),

  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      duration: z.string(),
      description: z.string(),
    }),
  ),

  skills: z.array(z.string()),
});

export const resumeAgent = new Agent({
  id: "resumeAgent",
  name: "Resume Parser",

  instructions: `
You are a resume parsing assistant.

Your job is to extract structured information from resumes.

The resume may be provided as:
- plain text
- an image of a resume

Extract only information that is actually present in the provided
resume.

Do not invent, guess, or infer information that is not explicitly
available.

If a field is not present or cannot be read, return an empty string.

For education and experience, return an empty array when no relevant
information is available.

When reading a resume image:
- Carefully inspect the entire image.
- Read text from all visible sections.
- Preserve important information while normalizing it into the
  required structured format.
- Do not confuse headings, labels, or decorative text with resume data.
- If text is unclear or unreadable, do not guess it.

For experience descriptions, keep them concise while preserving the
important responsibilities, achievements, and technologies mentioned.

For skills, extract individual skills rather than returning one
combined sentence.

Return information according to the provided structured schema.
`,

  model: tokenHarborVision("gpt-6-luna-fast"),
});
