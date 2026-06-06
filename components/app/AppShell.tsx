"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  BookOpen,
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { WalletButton } from "./wallet";

const NAV = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Agents", href: "/app/agents", icon: Users },
  { label: "Register", href: "/app/register", icon: PlusCircle },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active =
          item.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-cyan/10 text-ink"
                : "text-muted hover:bg-white/[0.04] hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId="nav-active"
                className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-cyan"
              />
            )}
            <item.icon
              className={`h-4 w-4 ${active ? "text-cyan" : "text-faint group-hover:text-muted"}`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarInner() {
  return (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-2.5 px-2 py-1">
        <Logo className="h-8 w-8" />
        <span className="font-display text-lg font-semibold tracking-tight">
          Cred<span className="text-cyan">ora</span>
        </span>
      </Link>

      <div className="mt-7 px-1">
        <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
          Workspace
        </p>
        <NavLinks />
      </div>

      <div className="mt-auto space-y-3">
        <a
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-white/[0.04] hover:text-ink"
        >
          <BookOpen className="h-4 w-4 text-faint" />
          Back to site
          <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-faint" />
        </a>
        <div className="rounded-2xl border border-slate-line/60 bg-white/[0.02] p-3.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_8px_2px_rgba(210,96,26,0.7)]" />
            <span className="font-mono text-[11px] text-muted">
              Mantle Testnet
            </span>
          </div>
          <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-faint">
            Registry · DecisionLogger · Reputation deployed &amp; verified.
          </p>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-line/50 bg-navy-deep/40 p-5 backdrop-blur-xl lg:flex">
        <SidebarInner />
      </aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-navy-deep/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-line/60 bg-navy p-5 lg:hidden"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg border border-slate-line/70 text-muted"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
              <div onClick={() => setOpen(false)}>
                <SidebarInner />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* main column */}
      <div className="lg:pl-64">
        {/* topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-line/50 bg-navy/70 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-line/70 text-ink lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden items-center gap-2 rounded-xl border border-slate-line/60 bg-white/[0.02] px-3 py-1.5 sm:flex">
              <span className="font-mono text-[11px] text-faint">⌘K</span>
              <span className="font-mono text-[12px] text-muted">
                Search agents, assets, tx…
              </span>
            </div>
          </div>
          <WalletButton />
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
