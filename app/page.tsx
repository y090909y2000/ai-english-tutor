import Link from "next/link";
import { SCENARIOS } from "@/lib/scenarios";
import Logo from "./components/Logo";
import { SCENARIO_STYLE } from "./components/scenario-style";

const STEPS = [
  {
    title: "挑一個情境",
    text: "從點餐到面試，選今天最想練的場合。AI 會扮演對方，先開口問你第一句。",
  },
  {
    title: "用英文回答",
    text: "打出你想說的話，AI 依照角色接著聊，讓對話一來一往地進行下去。",
  },
  {
    title: "看看怎麼講更好",
    text: "每句話下面都能糾正文法，或看一個更完整自然的回答，附中文說明。",
  },
];

// 首頁（landing page）：靜態頁面，不讀任何使用者資料
export default function LandingPage() {
  return (
    <div className="glow flex-1">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <nav className="flex items-center gap-1">
          <Link href="/login" className="btn-ghost">
            登入
          </Link>
          <Link href="/register" className="btn-primary !px-5 !py-2 text-sm">
            註冊
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-10 pb-20 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
          <div className="animate-rise">
            <p className="inline-block rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
              情境式英文對話練習
            </p>
            <h1 className="mt-5 font-display text-4xl leading-tight font-semibold sm:text-6xl sm:leading-[1.15]">
              開口說英文，
              <br />
              從一場<span className="text-accent">安心的對話</span>開始
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              AI 扮演服務生、面試官或老朋友陪你練習。說錯沒關係，按一下就知道下次可以怎麼講得更好。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register" className="btn-primary">
                註冊開始練習 <span aria-hidden>→</span>
              </Link>
              <Link href="/practice" className="btn-ghost">
                我已經有帳號
              </Link>
            </div>
          </div>

          <ChatPreview />
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-3xl font-semibold">
            八個情境，練你真正用得到的英文
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {SCENARIOS.map((s) => (
              <li key={s.id} className="card p-5">
                <span
                  aria-hidden
                  className={`grid size-12 place-items-center rounded-2xl text-2xl ${SCENARIO_STYLE[s.id].tint}`}
                >
                  {s.emoji}
                </span>
                <h3 className="mt-4 font-semibold">{s.label}</h3>
                <p className="mt-1 text-sm text-muted">
                  {SCENARIO_STYLE[s.id].blurb}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-3xl font-semibold">怎麼練習</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="card p-6">
                <span className="font-display text-4xl font-semibold text-accent">
                  {index + 1}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-muted">
            練過的對話和糾錯紀錄會存在你的帳號裡，登入後隨時回來複習。
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="rounded-[2rem] bg-ink px-6 py-14 text-center text-paper">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              今天想練哪一種對話？
            </h2>
            <p className="mt-3 opacity-75">用 Email 建立帳號就能開始。</p>
            <Link
              href="/register"
              className="mt-8 inline-flex rounded-full bg-accent px-7 py-3 font-semibold text-white transition hover:-translate-y-0.5"
            >
              立即註冊
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-8 text-center text-sm text-muted">
        AI 英文家教｜AI 的回覆與建議可能有誤，僅供學習參考。
      </footer>
    </div>
  );
}

// 示意畫面（固定內容）
function ChatPreview() {
  return (
    <figure className="card animate-rise mx-auto w-full max-w-md p-5 [animation-delay:150ms]">
      <figcaption className="flex items-center justify-between border-b border-line pb-3 text-sm">
        <span className="font-semibold">🍔 點餐・餐廳服務生</span>
        <span className="text-muted">示意畫面</span>
      </figcaption>
      <div className="mt-4 space-y-3 text-sm" lang="en">
        <p className="w-fit max-w-[85%] rounded-2xl rounded-tl-md bg-brand-soft px-4 py-2.5">
          Hi there! What can I get started for you today?
        </p>
        <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-md bg-ink px-4 py-2.5 text-paper">
          I wants two burger.
        </p>
        <div className="ml-auto w-[90%] rounded-2xl border border-line p-4">
          <p className="text-xs font-semibold text-muted" lang="zh-Hant">
            糾正文法
          </p>
          <p className="mt-2 font-medium">
            I <del className="rounded bg-bad-soft px-1 text-bad">wants</del>{" "}
            <ins className="rounded bg-good-soft px-1 text-good no-underline">
              want
            </ins>{" "}
            two{" "}
            <ins className="rounded bg-good-soft px-1 text-good no-underline">
              burgers
            </ins>
            .
          </p>
          <p className="mt-2 text-muted" lang="zh-Hant">
            主詞是 I，動詞用 want；兩個漢堡要用複數。
          </p>
        </div>
      </div>
    </figure>
  );
}
