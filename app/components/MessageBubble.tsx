import type { ReactNode } from "react";

// 一則對話泡泡；children 放在泡泡下面（回饋按鈕）
export default function MessageBubble({
  role,
  content,
  avatar,
  children,
}: {
  role: "user" | "assistant";
  content: string;
  // AI 這一側的頭像（場景 emoji）
  avatar?: string;
  children?: ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div
      className={`animate-rise flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}
    >
      <div className="flex max-w-[85%] items-end gap-2">
        {!isUser && <Avatar emoji={avatar} />}
        <p
          className={`min-w-0 rounded-3xl px-4 py-3 leading-relaxed whitespace-pre-wrap wrap-break-word ${
            isUser
              ? "rounded-br-md bg-ink text-paper"
              : "rounded-bl-md border border-line bg-surface shadow-soft"
          }`}
        >
          {content}
        </p>
      </div>
      {children}
    </div>
  );
}

export function Avatar({ emoji = "💬" }: { emoji?: string }) {
  return (
    <span
      aria-hidden
      className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-lg"
    >
      {emoji}
    </span>
  );
}
