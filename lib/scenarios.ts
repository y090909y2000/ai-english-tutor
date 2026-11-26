// 練習場景（前後端共用）。openings 是 AI 開場的第一個問題，選場景時隨機挑一句。
export const SCENARIOS = [
  {
    id: "ordering",
    label: "點餐",
    emoji: "🍔",
    aiRole: "餐廳服務生",
    openings: [
      "Hi there, welcome in! What can I get started for you today?",
      "Good evening! Would you like to start with something to drink?",
    ],
  },
  {
    id: "interview",
    label: "面試",
    emoji: "💼",
    aiRole: "面試官",
    openings: [
      "Thanks for coming in today. Could you tell me a little about yourself?",
      "Nice to meet you. What made you apply for this position?",
    ],
  },
  {
    id: "airport",
    label: "機場",
    emoji: "✈️",
    aiRole: "航空公司櫃檯人員",
    openings: [
      "Good morning! May I see your passport, and where are you flying today?",
      "Hello! How many bags would you like to check in today?",
    ],
  },
  {
    id: "smalltalk",
    label: "閒聊",
    emoji: "☕",
    aiRole: "咖啡店裡剛認識的人",
    openings: [
      "Hey, this place is pretty nice, isn't it? Do you come here often?",
      "Hi! How's your day going so far?",
    ],
  },
  {
    id: "workplace",
    label: "職場",
    emoji: "🏢",
    aiRole: "同事",
    openings: [
      "Morning! How's that project coming along?",
      "Hey, do you have a minute? What are you working on today?",
    ],
  },
  {
    id: "meeting",
    label: "會議",
    emoji: "📊",
    aiRole: "會議主持人",
    openings: [
      "Alright, let's get started. Could you give us a quick update on your progress?",
      "Thanks for joining. What would you like to add to today's agenda?",
    ],
  },
  {
    id: "partner",
    label: "戀人",
    emoji: "💕",
    aiRole: "你的另一半",
    openings: [
      "Hey, you're finally home! How was your day, sweetheart?",
      "I've been thinking about this weekend. What would you like to do together?",
    ],
  },
  {
    id: "friend",
    label: "朋友",
    emoji: "🤝",
    aiRole: "你的老朋友",
    openings: [
      "Hey! Long time no see. What have you been up to lately?",
      "Yo! Got any plans for the weekend?",
    ],
  },
] as const;

export type Scenario = (typeof SCENARIOS)[number];
export type ScenarioId = Scenario["id"];

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// 單則訊息字數上限（前端輸入框與後端檢查共用）
export const MAX_MESSAGE_LENGTH = 500;

export function findScenario(id: unknown): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
