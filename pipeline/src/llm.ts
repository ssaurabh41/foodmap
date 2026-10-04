import OpenAI from "openai";

/** The one thing the pipeline needs from a language model: a JSON answer to a prompt. */
export interface LlmClient {
  completeJson(system: string, user: string): Promise<unknown>;
}

export interface DeepSeekOptions {
  apiKey: string;
  model?: string;
  baseURL?: string;
}

/**
 * DeepSeek's API is OpenAI-compatible, so the OpenAI SDK is used with DeepSeek's base URL.
 * Note: DeepSeek's chat models are text-only, so menu photos need a separate OCR step.
 */
export function createDeepSeekClient({
  apiKey,
  model = "deepseek-chat",
  baseURL = "https://api.deepseek.com",
}: DeepSeekOptions): LlmClient {
  const client = new OpenAI({ apiKey, baseURL });
  return {
    async completeJson(system, user) {
      const res = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });
      const content = res.choices[0]?.message.content;
      if (!content) throw new Error(`DeepSeek returned no content (finish_reason: ${res.choices[0]?.finish_reason})`);
      try {
        return JSON.parse(content);
      } catch {
        throw new Error(`DeepSeek returned invalid JSON: ${content.slice(0, 200)}`);
      }
    },
  };
}
