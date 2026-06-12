import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Japan Trip Shopping Planner — 去日本前，先把購物規劃好",
  description:
    "建立你的日本購物清單、預算、退稅試算與行李規劃。極簡無印風的旅行購物規劃工具。",
  openGraph: {
    title: "Japan Trip Shopping Planner",
    description: "日本旅行購物規劃助手",
    type: "website",
    locale: "zh_TW",
  },
  metadataBase: new URL("https://example.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen bg-ink-50/40">
        <Nav />
        <main className="mx-auto max-w-6xl px-5 py-10 fade-in">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
