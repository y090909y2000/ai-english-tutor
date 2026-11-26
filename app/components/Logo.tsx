import Link from "next/link";

export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-xl bg-accent font-display text-lg font-bold text-white"
      >
        E
      </span>
      <span className="font-display text-lg font-semibold">AI 英文家教</span>
    </Link>
  );
}
