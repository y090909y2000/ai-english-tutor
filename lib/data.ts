import { notFound } from "next/navigation";
import { isValidObjectId, Types } from "mongoose";
import { requireUser } from "@/lib/auth";
import {
  toBetterAnswerResult,
  toGrammarResult,
  type BetterAnswerResult,
  type GrammarResult,
} from "@/lib/feedback";
import { Conversation } from "@/models/Conversation";
import { Feedback } from "@/models/Feedback";

// 歷史紀錄的資料查詢（只能在伺服器端使用）。
// 每個函式自己確認登入者，不接受外部傳入 userId，就不會查到別人的資料。

export async function listMyConversations() {
  const user = await requireUser(); // 同時會連上資料庫
  const userId = new Types.ObjectId(user.id);

  const conversations = await Conversation.find({ userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const counts = await Feedback.aggregate<{
    _id: Types.ObjectId;
    corrections: number;
    suggestions: number;
  }>([
    {
      $match: {
        userId,
        conversationId: { $in: conversations.map((c) => c._id) },
      },
    },
    {
      $group: {
        _id: "$conversationId",
        // 只算真的有錯誤的糾錯
        corrections: { $sum: { $cond: ["$hasError", 1, 0] } },
        suggestions: {
          $sum: { $cond: [{ $eq: ["$kind", "suggestion"] }, 1, 0] },
        },
      },
    },
  ]);

  return conversations.map((c) => {
    const count = counts.find((x) => String(x._id) === String(c._id));
    return {
      id: String(c._id),
      scenarioId: c.scenario,
      createdAt: c.createdAt,
      replies: c.messages.filter((m) => m.role === "user").length,
      preview: c.messages.find((m) => m.role === "user")?.content ?? "",
      corrections: count?.corrections ?? 0,
      suggestions: count?.suggestions ?? 0,
    };
  });
}

export async function getMyConversation(id: string) {
  const user = await requireUser();
  if (!isValidObjectId(id)) notFound();

  // 同時比對 userId：不存在和「是別人的」回應相同
  const conversation = await Conversation.findOne({
    _id: id,
    userId: user.id,
  }).lean();
  if (!conversation) notFound();

  const feedbacks = await Feedback.find({
    userId: user.id,
    conversationId: conversation._id,
  }).lean();

  return {
    id: String(conversation._id),
    scenarioId: conversation.scenario,
    createdAt: conversation.createdAt,
    messages: conversation.messages.map((m) => {
      const mine = feedbacks.filter(
        (f) => String(f.messageId) === String(m._id),
      );
      const correction = mine.find((f) => f.kind === "correction");
      const suggestion = mine.find((f) => f.kind === "suggestion");
      return {
        id: String(m._id),
        role: m.role,
        content: m.content,
        grammar: correction
          ? (toGrammarResult(correction) satisfies GrammarResult)
          : null,
        better: suggestion
          ? (toBetterAnswerResult(suggestion) satisfies BetterAnswerResult)
          : null,
      };
    }),
  };
}

export function formatDate(date: Date) {
  return date.toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    dateStyle: "medium",
    timeStyle: "short",
  });
}
