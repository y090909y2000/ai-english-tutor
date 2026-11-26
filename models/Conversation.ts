import mongoose, { type InferSchemaType, type Model } from "mongoose";

// 對話中的一句話。直接內嵌在 Conversation 裡，讀一次就拿到整場對話。
const messageSchema = new mongoose.Schema(
  {
    // user = 學習者，assistant = AI 老師
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    // 這句是打字還是用說的
    inputMode: { type: String, enum: ["text", "voice"], default: "text" },
    createdAt: { type: Date, default: Date.now },
  },
  // 每句話會自動有 _id，糾錯建議用它指回是哪一句
);

// 一場完整的練習
const conversationSchema = new mongoose.Schema(
  {
    // 這場練習是誰的。所有查詢都要帶上它
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, trim: true, default: "未命名練習" },
    // 練習場景的 id（見 lib/scenarios.ts）
    scenario: { type: String, trim: true, default: "" },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    // 依陣列順序就是對話順序
    messages: { type: [messageSchema], default: [] },
    // 練習結束後的總評
    summary: { type: String, default: "" },
    endedAt: { type: Date },
  },
  // 自動產生 createdAt（開始時間）與 updatedAt
  { timestamps: true, collection: "tutor_conversations" },
);

// 歷史紀錄頁：查某個人的對話，依時間新到舊
conversationSchema.index({ userId: 1, createdAt: -1 });

export type ConversationDoc = InferSchemaType<typeof conversationSchema>;

export const Conversation: Model<ConversationDoc> =
  (mongoose.models.Conversation as Model<ConversationDoc>) ||
  mongoose.model<ConversationDoc>("Conversation", conversationSchema);
