import bcrypt from "bcryptjs";
import { fail } from "@/lib/api";
import { createSession } from "@/lib/auth";
import { parseCredentials } from "@/lib/credentials";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(request: Request) {
  const input = parseCredentials(await request.json().catch(() => null));
  if (!input) return fail("請輸入正確的 Email，密碼需 8～72 字元", 400);

  try {
    await connectDB();
    await User.init(); // 確保 Email 唯一索引已建立
    const user = await User.create({
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 12),
    });
    await createSession(String(user._id));
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return fail("這個 Email 已經註冊過了", 409);
    }
    console.error("[register]", error);
    return fail("註冊失敗，請稍後再試", 500);
  }
}
