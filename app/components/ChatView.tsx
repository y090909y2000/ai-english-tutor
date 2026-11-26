"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  MAX_MESSAGE_LENGTH,
  type ChatMessage,
  type Scenario,
} from "@/lib/scenarios";
import MessageBubble, { Avatar } from "./MessageBubble";
import MessageFeedback from "./MessageFeedback";
import { SCENARIO_STYLE } from "./scenario-style";

type Props = {
  scenario: Scenario;
  opening: string;
  onBack: () => void;
};

// id：存進資料庫後才有，有 id 才能做糾錯
type ViewMessage = ChatMessage & { id?: string };

export default function ChatView({ scenario, opening, onBack }: Props) {
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<ViewMessage[]>([
    { role: "assistant", content: opening },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // 有新訊息時捲到最下面
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages([...messages, { role: "user", content: text }]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          conversationId
            ? { conversationId, text }
            : { scenarioId: scenario.id, opening, text },
        ),
      });
      if (res.status === 401) return window.location.assign("/login");
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.reply) {
        throw new Error(data.error ?? "發生錯誤，請再試一次");
      }
      setConversationId(data.conversationId);
      setMessages([
        ...messages,
        { role: "user", content: text, id: data.userMessageId },
        { role: "assistant", content: data.reply },
      ]);
    } catch (e) {
      // 送失敗：收回這句話並放回輸入框，讓使用者直接重送
      setMessages(messages);
      // 如果等待時已經打了新內容，就不要蓋掉
      setInput((current) => current || text);
      setError(
        e instanceof TypeError
          ? "連不上伺服器，請檢查網路"
          : (e as Error).message,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glow flex h-dvh flex-col">
      <header className="border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="換場景"
            className="btn-ghost shrink-0"
          >
            ← <span className="ml-1 max-sm:hidden">換場景</span>
          </button>
          <span
            aria-hidden
            className={`grid size-11 shrink-0 place-items-center rounded-2xl text-2xl ${SCENARIO_STYLE[scenario.id].tint}`}
          >
            {scenario.emoji}
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-lg leading-tight font-semibold">
              {scenario.label}
            </h1>
            <p className="truncate text-xs text-muted">
              對象：{scenario.aiRole}
            </p>
          </div>
          <Link href="/history" className="btn-ghost ml-auto shrink-0">
            歷史紀錄
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto" aria-live="polite">
        <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6">
          {messages.map((message, index) => (
            <MessageBubble key={index} {...message} avatar={scenario.emoji}>
              {message.role === "user" && message.id && conversationId && (
                <MessageFeedback
                  conversationId={conversationId}
                  messageId={message.id}
                />
              )}
            </MessageBubble>
          ))}
          {loading && (
            <div className="flex items-end gap-2">
              <Avatar emoji={scenario.emoji} />
              <p className="flex gap-1.5 rounded-3xl rounded-bl-md border border-line bg-surface px-4 py-4">
                <span className="sr-only">對方正在輸入</span>
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    aria-hidden
                    className="size-2 animate-bounce rounded-full bg-muted"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      <div className="mx-auto w-full max-w-3xl px-4 pb-4">
        {error && (
          <p
            role="alert"
            className="mb-2 rounded-xl bg-bad-soft px-4 py-2 text-sm text-bad"
          >
            {error}
          </p>
        )}

        <form
          onSubmit={send}
          className="card flex items-center gap-2 !rounded-full p-1.5 focus-within:!border-brand"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Type your reply in English…"
            aria-label="輸入英文回覆"
            autoComplete="off"
            autoFocus
            className="min-w-0 flex-1 bg-transparent px-4 py-2 outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary !px-5 !py-2.5"
          >
            送出
          </button>
        </form>
      </div>
    </div>
  );
}
