import { createOpenAI } from "@ai-sdk/openai";

const LOVABLE_AIG_RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

export function createLovableAiGatewayRunIdFetch(initialRunId?: string) {
  let runId = initialRunId?.trim() || undefined;

  return {
    fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(LOVABLE_AIG_RUN_ID_HEADER)) {
        headers.set(LOVABLE_AIG_RUN_ID_HEADER, runId);
      }
      const response = await fetch(input, { ...init, headers });
      const minted = response.headers.get(LOVABLE_AIG_RUN_ID_HEADER)?.trim();
      if (!runId && minted) runId = minted;
      return response;
    }) as typeof fetch,
    getRunId: () => runId,
  };
}

/** Builds the Responses-API provider for the Lovable AI Gateway. Server-only. */
export function createResponsesProvider() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured on this server.");
  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const lovable = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: key,
    headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  return { lovable, runIdFetch };
}

export const responsesProviderOptions = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    store: false,
    include: ["reasoning.encrypted_content"],
  },
} as const;

/** Maps gateway/SDK failures to a safe, user-facing message. */
export function toUserFacingAiError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);
  const status =
    typeof error === "object" && error !== null && "statusCode" in error
      ? Number((error as { statusCode?: number }).statusCode)
      : undefined;

  if (status === 402 || /402|insufficient credits/i.test(message)) {
    return new Error("AI credits are exhausted. Please add credits to continue.");
  }
  if (status === 429 || /429|rate limit/i.test(message)) {
    return new Error("Too many requests right now. Please wait a moment and try again.");
  }
  if (status === 403) {
    return new Error("This request was declined by the AI provider.");
  }
  if (status === 401 || /not configured/i.test(message)) {
    return new Error("AI is not configured correctly on this server.");
  }
  if (status === 400) {
    return new Error("The input could not be processed. Try shortening or rewording it.");
  }
  return new Error("The AI service could not complete this request. Please try again.");
}
