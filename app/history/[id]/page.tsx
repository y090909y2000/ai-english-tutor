import Link from "next/link";
import { Suspense } from "react";
import { formatDate, getMyConversation } from "@/lib/data";
import { findScenario } from "@/lib/scenarios";
import MessageBubble from "../../components/MessageBubble";
import MessageFeedback from "../../components/MessageFeedback";

export default function ConversationPage({
  params,
}: PageProps<"/history/[id]">) {
  return (
    <div className="glow flex-1">
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <Link href="/history" className="btn-ghost -ml-3">
          ← 回歷史紀錄
        </Link>
        <Suspense fallback={<p className="mt-4 text-muted">載入中…</p>}>
          <Detail params={params} />
        </Suspense>
      </main>
    </div>
  );
}

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // 裡面會檢查登入和擁有者，不是本人的會顯示找不到
  const conversation = await getMyConversation(id);
  const scenario = findScenario(conversation.scenarioId);

  return (
    <>
      <header className="mt-4 border-b border-line pb-5">
        <h1 className="font-display text-3xl font-semibold">
          {scenario?.emoji} {scenario?.label ?? "練習"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {formatDate(conversation.createdAt)}
        </p>
      </header>

      <div className="mt-6 space-y-5">
        {conversation.messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            avatar={scenario?.emoji}
          >
            {message.role === "user" && (
              <MessageFeedback
                key={message.id}
                conversationId={conversation.id}
                messageId={message.id}
                savedGrammar={message.grammar}
                savedBetter={message.better}
              />
            )}
          </MessageBubble>
        ))}
      </div>
    </>
  );
}
