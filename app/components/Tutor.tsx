"use client";

import { useState } from "react";
import { SCENARIOS, type Scenario } from "@/lib/scenarios";
import ChatView from "./ChatView";
import NavBar from "./NavBar";
import { SCENARIO_STYLE } from "./scenario-style";

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// 控制目前顯示「選場景」還是「對話」畫面
export default function Tutor({ email }: { email: string }) {
  const [session, setSession] = useState<{
    scenario: Scenario;
    opening: string;
  } | null>(null);

  function start(scenario: Scenario) {
    setSession({ scenario, opening: pickRandom<string>(scenario.openings) });
  }

  if (session) {
    return <ChatView {...session} onBack={() => setSession(null)} />;
  }

  return (
    <div className="glow flex-1">
      <main className="mx-auto w-full max-w-4xl px-5 py-5">
        <NavBar email={email} />
        <h1 className="mt-14 font-display text-3xl font-semibold sm:text-4xl">
          今天想練哪一種對話？
        </h1>
        <p className="mt-3 text-muted">選一個情境，對方會先開口。</p>

        <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {SCENARIOS.map((scenario, index) => (
            <li
              key={scenario.id}
              className="animate-rise"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <button
                type="button"
                onClick={() => start(scenario)}
                className="card group flex h-full w-full cursor-pointer flex-col items-start p-5 text-left transition hover:-translate-y-1 hover:border-accent"
              >
                <span
                  className={`grid size-14 place-items-center rounded-2xl text-3xl transition group-hover:scale-110 ${SCENARIO_STYLE[scenario.id].tint}`}
                  aria-hidden
                >
                  {scenario.emoji}
                </span>
                <span className="mt-4 text-lg font-semibold">
                  {scenario.label}
                </span>
                <span className="mt-1 text-sm text-muted">
                  {SCENARIO_STYLE[scenario.id].blurb}
                </span>
                <span className="mt-4 text-xs font-medium text-brand">
                  對象：{scenario.aiRole}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
