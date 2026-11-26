import mongoose, { type InferSchemaType, type Model } from "mongoose";

// 學習者對某則糾錯／建議做過的一個動作
const usageSchema = new mongoose.Schema({
  // viewed = 點開來看，accepted = 採用，dismissed = 忽略，practiced = 照著再練一次
  action: {
    type: String,
    enum: ["viewed", "accepted", "dismissed", "practiced"],
    required: true,
  },
  // 學習者實際打出或說出的內容（practiced / accepted 時可填）
  text: { type: String, default: "" },
  // 如果這次使用變成對話中的一句話，記下那句的 _id
  messageId: { type: mongoose.Schema.Types.ObjectId },
  // practiced 時：這次有沒有用對
  isCorrect: { type: Boolean },
  usedAt: { type: Date, default: Date.now },
});

// 糾錯結果裡的單一錯誤
const mistakeSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["grammar", "vocabulary", "spelling", "expression", "other"],
      default: "other",
    },
    originalText: { type: String, default: "" },
    suggestedText: { type: String, default: "" },
    explanation: { type: String, default: "" },
  },
  { _id: false },
);

// 一句話的一次糾錯或建議（同一句同一種類只存一筆）
const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    // 針對哪一句話（Conversation.messages 裡的 _id）
    messageId: { type: mongoose.Schema.Types.ObjectId, required: true },
    // correction = 糾正文法，suggestion = 更好的回答
    kind: { type: String, enum: ["correction", "suggestion"], required: true },
    // 學習者原本的整句話
    originalText: { type: String, required: true },
    // 改正後或建議的整句說法
    suggestedText: { type: String, required: true },
    // 「更好的回答」的說明
    explanation: { type: String, default: "" },
    // 以下兩個只有糾正文法會用到
    hasError: { type: Boolean, default: false },
    mistakes: { type: [mistakeSchema], default: [] },
    // 使用紀錄
    usages: { type: [usageSchema], default: [] },
  },
  { timestamps: true, collection: "tutor_feedbacks" },
);

feedbackSchema.index({ messageId: 1, kind: 1 }, { unique: true });
feedbackSchema.index({ userId: 1, conversationId: 1 });

export type FeedbackDoc = InferSchemaType<typeof feedbackSchema>;

export const Feedback: Model<FeedbackDoc> =
  (mongoose.models.Feedback as Model<FeedbackDoc>) ||
  mongoose.model<FeedbackDoc>("Feedback", feedbackSchema);
