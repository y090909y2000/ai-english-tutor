import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
  verifySession,
} from "@/lib/session";
import { User } from "@/models/User";

// 只能在伺服器端使用

export type CurrentUser = { id: string; email: string };

export async function createSession(userId: string) {
  (await cookies()).set(SESSION_COOKIE, await signSession(userId), {
    httpOnly: true, // 前端 JavaScript 讀不到
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

// 驗證 cookie，並確認帳號還存在於資料庫
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const userId = await verifySession(token);
  if (!userId || !isValidObjectId(userId)) return null;

  await connectDB();
  const user = await User.findById(userId).select("email").lean();
  return user ? { id: userId, email: user.email } : null;
}

// 給頁面用：沒登入就導到登入頁
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
