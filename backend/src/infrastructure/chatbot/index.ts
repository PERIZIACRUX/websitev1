/**
 * lib/chatbot/index.ts
 * ──────────────────────────────────────────────────────────────────────────
 * AI chatbot abstraction layer.
 *
 * PLACEHOLDER — Will be implemented in a later step.
 *
 * This module will provide:
 *   - Chat completion calls to the AI provider
 *   - Prompt templates for PERIZIA-specific FAQ
 *   - Response streaming support
 *   - Guardrails (restrict to fest-related queries)
 *
 * Design principles:
 *   - AI_API_KEY is server-only.
 *   - Chat completions are made server-side (API route), not directly
 *     from the browser to the AI provider.
 *   - Inputs are sanitised before being sent to the AI.
 *   - Rate limiting will be applied to the chatbot endpoint.
 */


export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Placeholder: get a chatbot response for a user message.
 *
 * @throws {Error} Always throws — not yet implemented.
 */
export async function getChatbotResponse(
  _messages: ChatMessage[]
): Promise<string> {
  throw new Error(
    "[lib/chatbot] getChatbotResponse() is not yet implemented. " +
      "AI chatbot integration will be built in a later step."
  );
}
