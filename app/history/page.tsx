import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { formatDate, listMyConversations } from "@/lib/data";
import { findScenario } from "@/lib/scenarios";
import NavBar from "../components/NavBar";
import { SCENARIO_STYLE } from "../components/scenario-style";

export default function HistoryPage() {
  return (
    <div className="glow flex-1">
      <main className="mx-auto w-full max-w-3xl px-5 py-5">
        <Suspense fallback={<p className="text-muted">載入中…</p>}>
          <HistoryList />
        </Suspense>
      </main>
    </div>
  );
}

async function HistoryList() {
  const user = await requireUser();
  const conversations = await listMyConversations();

  return (
    <>
      <NavBar email={user.email} />
      <h1 className="mt-14 font-display text-3xl font-semibold">歷史紀錄</h1>
      <p className="mt-2 text-muted">回頭看看練過的對話和糾錯建議。</p>

      {conversations.length === 0 && (
        <div className="card mt-8 p-10 text-center">
          <p className="text-muted">還沒有練習紀錄。</p>
          <Link href="/practice" className="btn-primary mt-5">
            開始第一場練習
          </Link>
        </div>
      )}

      <ul className="mt-8 space-y-3">
        {conversations.map((c) => {
          const scenario = findScenario(c.scenarioId);
          return (
            <li key={c.id}>
              <Link
                href={`/history/${c.id}`}
                className="card flex gap-4 p-4 transition hover:-translate-y-0.5 hover:border-accent"
              >
                <span
                  aria-hidden
                  className={`grid size-12 shrink-0 place-items-center rounded-2xl text-2xl ${scenario ? SCENARIO_STYLE[scenario.id].tint : "bg-brand-soft"}`}
                >
                  {scenario?.emoji ?? "💬"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-semibold">
                      {scenario?.label ?? "練習"}
                    </span>
                    <span className="text-xs text-muted">
                      {formatDate(c.createdAt)}
                    </span>
                  </p>
                  <p className="mt-1 truncate text-sm text-muted">
                    {c.preview}
                  </p>
                  <p className="mt-2.5 flex flex-wrap gap-2 text-xs font-medium">
                    <span className="rounded-full border border-line px-2.5 py-0.5">
                      回答 {c.replies} 次
                    </span>
                    <span className="rounded-full bg-bad-soft px-2.5 py-0.5 text-bad">
                      有錯誤的糾正 {c.corrections} 筆
                    </span>
                    <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-brand">
                      建議 {c.suggestions} 筆
                    </span>
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
