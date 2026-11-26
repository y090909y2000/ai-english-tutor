import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import Tutor from "../components/Tutor";

export default function PracticePage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted">載入中…</p>}>
      <ProtectedTutor />
    </Suspense>
  );
}

// 讀登入狀態需要包在 Suspense 裡
async function ProtectedTutor() {
  const user = await requireUser();
  // key：換帳號時整個重來，不沿用上一個人的畫面狀態
  return <Tutor key={user.id} email={user.email} />;
}
