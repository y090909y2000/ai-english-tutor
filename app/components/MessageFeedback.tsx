"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { BetterAnswerResult, GrammarResult } from "@/lib/feedback";

type Props = {
  conversationId: string;
  messageId: string;
  // 歷史紀錄頁帶入已存的結果
  savedGrammar?: GrammarResult | null;
  savedBetter?: BetterAnswerResult | null;
};

type Target = { conversationId: string; messageId: string };

// 一個回饋按鈕的狀態：打 API、保存結果、控制展開收合
function useFeedback<T>(url: string, target: Target, saved: T | null) {
  const [data, setData] = useState<T | null>(saved);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(saved !== null);
  // 使用者按過按鈕（用來決定要不要自動捲動）
  const [touched, setTouched] = useState(false);

  async function toggle() {
    if (loading) return;
    setTouched(true);
    // 已經查過就只切換顯示
    if (data) return setOpen(!open);

    setOpen(true);
    setLoading(true);
    setError("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(target),
      });
      if (res.status === 401) return window.location.assign("/login");
      const json = await res.json().catch(() => null);
      if (!res.ok || !json) {
        throw new Error(json?.error ?? "發生錯誤，請再按一次");
      }
      setData(json as T);
    } catch (e) {
      setError(
        e instanceof TypeError
          ? "連不上伺服器，請檢查網路"
          : (e as Error).message,
      );
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, error, open, touched, toggle };
}

// 顯示在使用者每句話下面的兩個按鈕和結果
export default function MessageFeedback({
  conversationId,
  messageId,
  savedGrammar = null,
  savedBetter = null,
}: Props) {
  const target = { conversationId, messageId };
  const grammar = useFeedback("/api/grammar", target, savedGrammar);
  const better = useFeedback("/api/better-answer", target, savedBetter);
  const ref = useRef<HTMLDivElement>(null);
  const touched = grammar.touched || better.touched;

  // 按按鈕後，捲動到看得見結果的位置
  useEffect(() => {
    if (touched && (grammar.open || better.open)) {
      ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [touched, grammar.open, grammar.data, better.open, better.data]);

  return (
    <div ref={ref} className="flex w-full flex-col items-end gap-2">
      <div className="flex gap-2">
        <FeedbackButton icon="✓" label="糾正文法" {...grammar} />
        <FeedbackButton icon="✦" label="更好的回答" {...better} />
      </div>

      {grammar.open && (
        <Card title="糾正文法" loading={grammar.loading} error={grammar.error}>
          {grammar.data &&
            (grammar.data.hasError ? (
              <>
                <p className="rounded-xl bg-good-soft px-3 py-2 font-medium text-good">
                  {grammar.data.correctedText}
                </p>
                <ul className="mt-3 divide-y divide-line">
                  {grammar.data.mistakes.map((mistake, index) => (
                    <li key={index} className="py-2.5 last:pb-0">
                      <span className="rounded bg-bad-soft px-1.5 py-0.5 text-bad line-through">
                        {mistake.originalText}
                      </span>
                      <span aria-hidden className="mx-2 text-muted">
                        →
                      </span>
                      <span className="rounded bg-good-soft px-1.5 py-0.5 font-medium text-good">
                        {mistake.suggestedText}
                      </span>
                      <p className="mt-1.5 text-muted">{mistake.explanation}</p>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="rounded-xl bg-good-soft px-3 py-2 text-good">
                這句沒有文法錯誤，很棒！
              </p>
            ))}
        </Card>
      )}

      {better.open && (
        <Card title="更好的回答" loading={better.loading} error={better.error}>
          {better.data && (
            <>
              <p className="rounded-xl bg-brand-soft px-3 py-2 font-medium text-brand">
                {better.data.suggestedText}
              </p>
              <p className="mt-3 leading-relaxed text-muted">
                {better.data.explanation}
              </p>
            </>
          )}
        </Card>
      )}
    </div>
  );
}

function FeedbackButton({
  icon,
  label,
  loading,
  open,
  toggle,
}: {
  icon: string;
  label: string;
  loading: boolean;
  open: boolean;
  toggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-expanded={open}
      className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition disabled:cursor-wait disabled:opacity-50 ${
        open
          ? "border-brand bg-brand-soft text-brand"
          : "border-line bg-surface text-muted hover:border-brand hover:text-brand"
      }`}
    >
      <span aria-hidden className="mr-1">
        {icon}
      </span>
      {label}
    </button>
  );
}

function Card({
  title,
  loading,
  error,
  children,
}: {
  title: string;
  loading: boolean;
  error: string;
  children: ReactNode;
}) {
  return (
    <section className="card animate-rise w-full max-w-[92%] p-4 text-sm wrap-break-word sm:max-w-[80%]">
      <h2 className="mb-2.5 text-xs font-semibold tracking-wider text-muted">
        {title}
      </h2>
      {loading && <p className="animate-pulse text-muted">分析中…</p>}
      {error && (
        <p role="alert" className="text-bad">
          {error}（再按一次按鈕重試）
        </p>
      )}
      {children}
    </section>
  );
}
