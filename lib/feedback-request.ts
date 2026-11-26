import { isValidObjectId } from "mongoose";
import { fail, withUser } from "@/lib/api";
import { findScenario, type ScenarioId } from "@/lib/scenarios";
import { Conversation } from "@/models/Conversation";
import { Feedback, type FeedbackDoc } from "@/models/Feedback";

export type FeedbackInput = {
  scenarioId: ScenarioId;
  // AI 上一句問了什麼
  question: string;
  // 使用者要檢查的那句話
  text: string;
};

type Options<T> = {
  kind: FeedbackDoc["kind"];
  generate: (input: FeedbackInput) => Promise<T>;
  // AI 結果 → 要存進資料庫的欄位
  toFields: (result: T) => Record<string, unknown>;
  // 資料庫紀錄 → 回傳給前端
  toResult: (doc: FeedbackDoc) => T;
};

// 兩個回饋 API 共用：確認是本人的句子 → 有存過就直接回傳 → 沒有才問 AI 並存檔
// 收：{ conversationId, messageId }
export function handleFeedback<T>(request: Request, options: Options<T>) {
  const { kind, generate, toFields, toResult } = options;

  return withUser(async (user) => {
    const body = await request.json().catch(() => null);
    const { conversationId, messageId } = body ?? {};
    if (!isValidObjectId(conversationId) || !isValidObjectId(messageId)) {
      return fail("訊息格式不正確", 400);
    }

    // 同時比對 userId，別人的對話一律當作不存在
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: user.id,
    }).lean();
    const index =
      conversation?.messages.findIndex(
        (m) => String(m._id) === String(messageId) && m.role === "user",
      ) ?? -1;
    if (!conversation || index < 0) return fail("找不到這句話", 404);

    const filter = { userId: user.id, conversationId, messageId, kind };
    const viewed = { $push: { usages: { action: "viewed" as const } } };

    // 查過的直接回傳紀錄，不重複花 API 費用
    const saved = await Feedback.findOneAndUpdate(filter, viewed, {
      returnDocument: "after",
    }).lean();
    if (saved) return Response.json(toResult(saved));

    const scenario = findScenario(conversation.scenario);
    if (!scenario) return fail("找不到這個練習場景", 400);
    const text = conversation.messages[index].content;

    let result: T;
    try {
      result = await generate({
        scenarioId: scenario.id,
        question: conversation.messages[index - 1]?.content ?? "",
        text,
      });
    } catch (error) {
      console.error("[feedback]", error);
      return fail("AI 暫時無法回應，請稍後再試", 502);
    }

    const doc = await Feedback.findOneAndUpdate(
      filter,
      { $setOnInsert: { originalText: text, ...toFields(result) }, ...viewed },
      { upsert: true, returnDocument: "after" },
    ).lean();
    return Response.json(toResult(doc!));
  });
}
