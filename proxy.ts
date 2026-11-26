import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// 第一道關卡：沒有有效登入憑證就直接導到登入頁。
// 真正的權限檢查仍在各個 API 和資料查詢裡（lib/auth.ts、lib/data.ts）。
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!(await verifySession(token))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/practice/:path*", "/history/:path*"],
};
