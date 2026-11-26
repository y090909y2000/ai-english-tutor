import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-4 py-16 text-center">
      <p>找不到這個頁面或紀錄。</p>
      <Link href="/" className="btn-primary mt-5">
        回首頁
      </Link>
    </main>
  );
}
