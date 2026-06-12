export default function Footer() {
  return (
    <footer className="border-t border-ink-200/70 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-10 text-sm text-ink-500">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Japan Trip Shopping Planner</p>
          <p className="text-ink-400">
            極簡 · 無印 · 為旅人設計
          </p>
        </div>
      </div>
    </footer>
  );
}
