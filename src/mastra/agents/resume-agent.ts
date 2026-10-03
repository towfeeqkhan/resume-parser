import { Agent } from "@mastra/core/agent";
import { z } from "zod";

import { tokenHarbor } from "../models";

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

Your job is to extract structured information from messy resume text.

Extract only information that is present in the provided resume.

Do not invent or guess information.

If a field is not present, return an empty string.

For education and experience, return an empty array when no information
is available.

Keep descriptions concise while preserving the important information.

Normalize the information into the required structured format.
`,

  model: tokenHarbor("gpt-6-luna-fast"),
});
