import Link from "next/link";

const links = [
  { href: "/dashboard", label: "我的旅行" },
  { href: "/stores", label: "商店" },
  { href: "/tools/tax", label: "退稅試算" },
  { href: "/tools/luggage", label: "行李計算" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2 text-ink-900">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-sakura-500" />
          <span className="text-sm font-semibold tracking-tight">Japan Trip Planner</span>
        </Link>
        <nav className="hidden gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-1.5 text-sm text-ink-600 hover:bg-ink-100 hover:text-ink-900 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/dashboard" className="btn-primary text-xs">
          開始規劃
        </Link>
      </div>
    </header>
  );
}
