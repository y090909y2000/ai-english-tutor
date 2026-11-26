"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { MIN_PASSWORD_LENGTH } from "@/lib/credentials";
import Logo from "./Logo";

// 登入和註冊共用的表單
export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "發生錯誤，請再試一次");
        setLoading(false);
        return;
      }
      window.location.assign("/practice");
    } catch {
      setError("連不上伺服器，請檢查網路");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-line bg-paper px-4 py-2.5 outline-none focus:border-brand";

  return (
    <div className="glow flex flex-1 flex-col items-center justify-center px-4 py-12">
      <Logo />
      <main className="card animate-rise mt-8 w-full max-w-sm p-7">
        <h1 className="font-display text-2xl font-semibold">
          {isRegister ? "建立帳號" : "歡迎回來"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isRegister ? "註冊後就能開始情境練習" : "登入後繼續你的練習"}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </label>
          <label className="block text-sm">
            密碼{isRegister && `（至少 ${MIN_PASSWORD_LENGTH} 字元）`}
            <input
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              maxLength={72}
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-bad-soft px-3 py-2 text-sm text-bad"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "處理中…" : isRegister ? "註冊" : "登入"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          {isRegister ? "已經有帳號？" : "還沒有帳號？"}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="ml-1 font-semibold text-accent-strong underline"
          >
            {isRegister ? "去登入" : "去註冊"}
          </Link>
        </p>
      </main>
    </div>
  );
}
