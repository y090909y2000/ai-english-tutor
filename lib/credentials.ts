// 帳號密碼規則（前後端共用）
export const MIN_PASSWORD_LENGTH = 8;
// bcrypt 只會用到前 72 bytes
const MAX_PASSWORD_BYTES = 72;

export function parseCredentials(body: unknown) {
  const { email, password } = (body ?? {}) as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string") return null;
  const normalized = email.trim().toLowerCase();
  if (
    normalized.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ||
    password.length < MIN_PASSWORD_LENGTH ||
    new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES
  ) {
    return null;
  }
  return { email: normalized, password };
}
