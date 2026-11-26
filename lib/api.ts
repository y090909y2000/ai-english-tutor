import { getCurrentUser, type CurrentUser } from "@/lib/auth";

export function fail(error: string, status: number) {
  return Response.json({ error }, { status });
}

// 需要登入的 API 都包在這裡：先驗證身分，再統一處理錯誤
export async function withUser(
  handler: (user: CurrentUser) => Promise<Response>,
): Promise<Response> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("請先登入", 401);
    return await handler(user);
  } catch (error) {
    // 詳細錯誤只印在伺服器，不回傳給前端
    console.error("[api]", error);
    return fail("伺服器暫時無法處理，請稍後再試", 500);
  }
}
