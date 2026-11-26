import mongoose from "mongoose";
import { Resolver } from "node:dns/promises";

// 這台機器預設 DNS 是 127.0.0.1，不回應 Node 的 SRV 查詢，
// 直接用 mongodb+srv:// 會出現 querySrv ECONNREFUSED。
// 解法：自己指定公開 DNS 查 SRV + TXT，手動組成一般 mongodb:// 連線字串。
async function resolveConnectionString(uri: string): Promise<string> {
  if (!uri.startsWith("mongodb+srv://")) return uri;

  const url = new URL(uri);
  const srvHost = url.hostname;

  const resolver = new Resolver();
  resolver.setServers(["8.8.8.8", "1.1.1.1"]);

  const srvRecords = await resolver.resolveSrv(`_mongodb._tcp.${srvHost}`);
  const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(",");

  // TXT 記錄放額外連線參數（例如 authSource、replicaSet）
  let txtParams = "";
  try {
    const txt = await resolver.resolveTxt(srvHost);
    txtParams = txt.map((chunks) => chunks.join("")).join("&");
  } catch {
    // 沒有 TXT 記錄也沒關係
  }

  const auth = url.username ? `${url.username}:${url.password}@` : "";
  const dbPath = url.pathname || "/";
  const userParams = url.search.slice(1);
  const params = ["ssl=true", txtParams, userParams].filter(Boolean).join("&");

  return `mongodb://${auth}${hosts}${dbPath}?${params}`;
}

// Next.js 開發模式會不斷 hot-reload，若每次都重新連線會爆連線數。
// 因此把連線快取在 global 上，重複呼叫時直接沿用同一條連線。
declare global {
  var _mongoosePromise: Promise<typeof mongoose> | undefined;
}

export function connectDB(): Promise<typeof mongoose> {
  if (!global._mongoosePromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("缺少環境變數 MONGODB_URI，請在 .env.local 設定");
    }

    global._mongoosePromise = resolveConnectionString(uri)
      .then((resolved) => mongoose.connect(resolved))
      .catch((error) => {
        // 連線失敗就清掉快取，下次呼叫才能重試
        global._mongoosePromise = undefined;
        throw error;
      });
  }

  return global._mongoosePromise;
}
