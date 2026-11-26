import { jwtVerify, SignJWT } from "jose";

// 登入憑證（JWT）的簽發與驗證。proxy.ts 和 lib/auth.ts 共用。
export const SESSION_COOKIE = "tutor_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 天

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET 未設定或太短（至少 32 字），請檢查 .env.local");
  }
  return new TextEncoder().encode(secret);
}

export function signSession(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

// 簽章正確且沒過期才回傳 userId
export async function verifySession(token: string | undefined) {
  if (!token) return null;
  const secret = getSecret();
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
