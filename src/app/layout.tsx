import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import "./globals.css";

export const metadata: Metadata = {
  title: "JualBeliRBX — Marketplace Item Roblox",
  description: "Tempat aman jual beli item Roblox: Limited, Robux, Gamepass, dan akun.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="id">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <span className="rounded bg-emerald-600 px-2 py-1 text-white">JB</span>
              <span>JualBeliRBX</span>
            </Link>
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="rounded px-3 py-2 hover:bg-zinc-100">Browse</Link>
              {user ? (
                <>
                  <Link href="/sell" className="rounded bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700">+ Jual Item</Link>
                  <Link href="/dashboard" className="rounded px-3 py-2 hover:bg-zinc-100">Dashboard</Link>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link href="/login" className="rounded px-3 py-2 hover:bg-zinc-100">Login</Link>
                  <Link href="/register" className="rounded bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700">Daftar</Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t border-zinc-200 bg-white py-8 text-center text-sm text-zinc-500">
          <p>JualBeliRBX — Marketplace komunitas Roblox Indonesia</p>
          <p className="mt-1">⚠️ Selalu pakai middleman trusted untuk transaksi besar</p>
        </footer>
      </body>
    </html>
  );
}
