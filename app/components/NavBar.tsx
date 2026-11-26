"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import Logo from "./Logo";

const LINKS = [
  { href: "/practice", label: "練習" },
  { href: "/history", label: "歷史紀錄" },
];

export default function NavBar({ email }: { email: string }) {
  const [error, setError] = useState(false);

  async function logout() {
    const res = await fetch("/api/auth/logout", { method: "POST" }).catch(
      () => null,
    );
    if (!res?.ok) return setError(true);
    // 整頁重新載入，清掉瀏覽器裡暫存的畫面
    window.location.assign("/login");
  }

  return (
    <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <Logo href="/practice" />
      <Suspense>
        <NavLinks />
      </Suspense>
      <span className="ml-auto hidden max-w-48 truncate text-sm text-muted sm:block">
        {email}
      </span>
      <button
        type="button"
        onClick={logout}
        className="btn-ghost border border-line max-sm:ml-auto"
      >
        {error ? "登出失敗，再試一次" : "登出"}
      </button>
    </nav>
  );
}

// 目前所在的分頁加上底色
function NavLinks() {
  const pathname = usePathname();
  return (
    <div className="flex gap-1">
      {LINKS.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`btn-ghost ${active ? "bg-brand-soft text-brand" : ""}`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
