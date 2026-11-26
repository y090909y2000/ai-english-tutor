import mongoose, { type InferSchemaType, type Model } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // 只存 bcrypt 雜湊後的密碼，不存原始密碼
    passwordHash: { type: String, required: true },
  },
  // collection 加 tutor_ 前綴，避免和同一個資料庫裡其他專案撞名
  { timestamps: true, collection: "tutor_users" },
);

export type UserDoc = InferSchemaType<typeof userSchema>;

export const User: Model<UserDoc> =
  (mongoose.models.User as Model<UserDoc>) ||
  mongoose.model<UserDoc>("User", userSchema);
