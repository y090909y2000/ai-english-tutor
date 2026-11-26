import { toBetterAnswerResult } from "@/lib/feedback";
import { handleFeedback } from "@/lib/feedback-request";
import { suggestBetterAnswer } from "@/lib/openai";

// POST /api/better-answer
// 收：{ conversationId, messageId }　回：BetterAnswerResult 或 { error }
export function POST(request: Request) {
  return handleFeedback(request, {
    kind: "suggestion",
    generate: suggestBetterAnswer,
    toFields: ({ suggestedText, explanation }) => ({
      suggestedText,
      explanation,
    }),
    toResult: toBetterAnswerResult,
  });
}
