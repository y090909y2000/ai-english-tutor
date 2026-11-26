import type { ScenarioId } from "@/lib/scenarios";

// 每個場景的外觀（只影響畫面，不影響資料）
export const SCENARIO_STYLE: Record<
  ScenarioId,
  { tint: string; blurb: string }
> = {
  ordering: { tint: "bg-orange-500/15", blurb: "看菜單、客製餐點、結帳" },
  interview: { tint: "bg-indigo-500/15", blurb: "自我介紹與追問應答" },
  airport: { tint: "bg-sky-500/15", blurb: "報到、行李、登機資訊" },
  smalltalk: { tint: "bg-amber-500/15", blurb: "和剛認識的人自然聊天" },
  workplace: { tint: "bg-emerald-500/15", blurb: "討論工作、請求協助" },
  meeting: { tint: "bg-violet-500/15", blurb: "報告進度、表達意見" },
  partner: { tint: "bg-pink-500/15", blurb: "分享日常、計畫週末" },
  friend: { tint: "bg-teal-500/15", blurb: "輕鬆口語、敘舊閒聊" },
};
