import { toGrammarResult } from "@/lib/feedback";
import { handleFeedback } from "@/lib/feedback-request";
import { checkGrammar } from "@/lib/openai";

// POST /api/grammar
// 收：{ conversationId, messageId }　回：GrammarResult 或 { error }
export function POST(request: Request) {
  return handleFeedback(request, {
    kind: "correction",
    generate: checkGrammar,
    toFields: ({ hasError, correctedText, mistakes }) => ({
      hasError,
      suggestedText: correctedText,
      mistakes,
    }),
    toResult: toGrammarResult,
  });
}
