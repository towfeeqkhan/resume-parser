import { createOpenAI } from "@ai-sdk/openai";

export const tokenHarbor = createOpenAI({
  baseURL: "https://tokenharbor.ai/v1",
  apiKey: process.env.TOKENHARBOR_API_KEY,
});

/**
 * The provider's default model uses the OpenAI Responses API, but the
 * TokenHarbor gateway silently drops image inputs on that endpoint. Its
 * Chat Completions endpoint handles vision correctly, so route through
 * `chat()` instead.
 */
export function tokenHarborVision(modelId: string) {
  return tokenHarbor.chat(modelId);
}
