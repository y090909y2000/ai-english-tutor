import bcrypt from "bcryptjs";
import { fail } from "@/lib/api";
import { createSession } from "@/lib/auth";
import { parseCredentials } from "@/lib/credentials";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

// 帳號不存在時也比對一次假雜湊，避免從回應時間猜出哪些 Email 註冊過
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

export async function POST(request: Request) {
  const input = parseCredentials(await request.json().catch(() => null));
  if (!input) return fail("Email 或密碼錯誤", 401);

  try {
    await connectDB();
    const user = await User.findOne({ email: input.email }).lean();
    const ok = await bcrypt.compare(
      input.password,
      user?.passwordHash ?? DUMMY_HASH,
    );
    if (!user || !ok) return fail("Email 或密碼錯誤", 401);

    await createSession(String(user._id));
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[login]", error);
    return fail("登入失敗，請稍後再試", 500);
  }
}
