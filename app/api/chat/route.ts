import { isValidObjectId, Types } from "mongoose";
import { fail, withUser } from "@/lib/api";
import { generateReply } from "@/lib/openai";
import { findScenario, MAX_MESSAGE_LENGTH } from "@/lib/scenarios";
import { Conversation } from "@/models/Conversation";

// 只把最近幾句送給 OpenAI，避免對話越長花費越高
const HISTORY_LIMIT = 20;
// 單場對話的訊息上限
const MAX_MESSAGES = 200;

// POST /api/chat
// 第一句：{ scenarioId, opening, text }
// 之後：  { conversationId, text }
// 回：    { conversationId, userMessageId, reply } 或 { error }
// 對話歷史一律從資料庫讀，不相信前端傳來的內容
export function POST(request: Request) {
  return withUser(async (user) => {
    const body = await request.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!text || text.length > MAX_MESSAGE_LENGTH) {
      return fail(`訊息格式不正確（每次最多 ${MAX_MESSAGE_LENGTH} 字）`, 400);
    }

    let existing = null;
    if (body.conversationId !== undefined) {
      if (!isValidObjectId(body.conversationId)) {
        return fail("找不到這場對話", 404);
      }
      // 同時比對 userId，別人的對話一律當作不存在
      existing = await Conversation.findOne({
        _id: body.conversationId,
        userId: user.id,
      }).lean();
      if (!existing) return fail("找不到這場對話", 404);
      if (existing.messages.length >= MAX_MESSAGES) {
        return fail("這場對話已經很長了，請開一場新的練習", 400);
      }
    }

    const scenario = findScenario(existing?.scenario ?? body.scenarioId);
    if (!scenario) return fail("找不到這個練習場景", 400);

    // 開場白必須是我們預設的句子之一
    if (!existing && !scenario.openings.some((o) => o === body.opening)) {
      return fail("開場內容不正確", 400);
    }

    const history = existing
      ? existing.messages.map(({ role, content }) => ({ role, content }))
      : [{ role: "assistant" as const, content: body.opening as string }];

    let reply: string;
    try {
      reply = await generateReply(
        scenario.id,
        [...history, { role: "user" as const, content: text }].slice(
          -HISTORY_LIMIT,
        ),
      );
    } catch (error) {
      console.error("[/api/chat]", error);
      return fail("AI 暫時無法回應，請稍後再試", 502);
    }

    // AI 回覆成功才存檔，一次存入使用者和 AI 兩句
    const userMessageId = new Types.ObjectId();
    const newMessages = [
      { _id: userMessageId, role: "user" as const, content: text },
      { role: "assistant" as const, content: reply },
    ];

    let conversationId: string;
    if (existing) {
      await Conversation.updateOne(
        { _id: existing._id, userId: user.id },
        { $push: { messages: { $each: newMessages } } },
      );
      conversationId = String(existing._id);
    } else {
      const created = await Conversation.create({
        userId: user.id,
        scenario: scenario.id,
        title: `${scenario.label}練習`,
        messages: [...history, ...newMessages],
      });
      conversationId = String(created._id);
    }

    return Response.json({
      conversationId,
      userMessageId: String(userMessageId),
      reply,
    });
  });
}
