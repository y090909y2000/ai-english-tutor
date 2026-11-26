// 糾錯／建議 API 的回傳格式（前後端共用）
// 欄位名稱對齊 models/Feedback.ts

export type GrammarResult = {
  hasError: boolean;
  // 整句改正後的版本（沒有錯就是原句）
  correctedText: string;
  mistakes: {
    category: "grammar" | "vocabulary" | "spelling" | "expression" | "other";
    originalText: string;
    suggestedText: string;
    explanation: string;
  }[];
};

export type BetterAnswerResult = {
  // 更完整、更自然的回答
  suggestedText: string;
  explanation: string;
};

// 資料庫紀錄 → API 回傳格式（API 和歷史紀錄頁共用）
export function toGrammarResult(doc: {
  hasError: boolean;
  suggestedText: string;
  mistakes: ArrayLike<GrammarResult["mistakes"][number]>;
}): GrammarResult {
  return {
    hasError: doc.hasError,
    correctedText: doc.suggestedText,
    // 只挑需要的欄位，轉成可以傳給前端的一般物件
    mistakes: Array.from(doc.mistakes, (m) => ({
      category: m.category,
      originalText: m.originalText,
      suggestedText: m.suggestedText,
      explanation: m.explanation,
    })),
  };
}

export function toBetterAnswerResult(doc: {
  suggestedText: string;
  explanation: string;
}): BetterAnswerResult {
  return {
    suggestedText: doc.suggestedText,
    explanation: doc.explanation,
  };
}
