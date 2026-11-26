"use client";

export default function ErrorPage() {
  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-4 py-16 text-center">
      <p>頁面暫時無法載入，請稍後再試。</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="btn-primary mt-5"
      >
        重新整理
      </button>
    </main>
  );
}
