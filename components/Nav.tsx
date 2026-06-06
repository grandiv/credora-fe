"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const LINKS = [
  { label: "Problem", href: "#problem" },
  { label: "How it works", href: "#how" },
  { label: "Agents", href: "#agents" },
  { label: "Tracks", href: "#tracks" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4 sm:pt-4"
    >
      <nav
        className={`flex w-full max-w-6xl items-center justify-between rounded-2xl border px-3 py-2.5 transition-all duration-500 sm:px-5 ${
          scrolled || open
            ? "panel border-slate-line/80 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.7)]"
            : "border-transparent bg-transparent"
        }`}
      >
        <a href="#top" className="group flex items-center gap-2.5">
          <Logo className="h-8 w-8 transition-transform duration-500 group-hover:rotate-[8deg]" />
          <span className="font-display text-lg font-semibold tracking-tight">
            Cred<span className="text-cyan">ora</span>
          </span>
        </a>

        {/* desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-slate-line/70 bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] text-muted lg:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_8px_2px_rgba(210,96,26,0.7)]" />
            Mantle Testnet
          </span>
          <a
            href="/app"
            className="group hidden items-center gap-1.5 rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-[#0b0e10] transition-all hover:shadow-[0_0_24px_-2px_rgba(210,96,26,0.6)] sm:inline-flex"
          >
            Launch App
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>

          {/* mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-line/70 bg-white/[0.03] text-ink transition-colors hover:bg-white/[0.08] md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="panel absolute left-3 right-3 top-[68px] z-50 overflow-hidden rounded-2xl border border-slate-line/80 p-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] md:hidden"
          >
            {LINKS.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.05 }}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-[15px] text-muted transition-colors hover:bg-white/5 hover:text-ink"
              >
                {l.label}
                <ArrowUpRight className="h-4 w-4 text-faint" />
              </motion.a>
            ))}
            <a
              href="/app"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-gold px-4 py-3 text-sm font-semibold text-[#0b0e10]"
            >
              Launch App
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <div className="mt-2 flex items-center justify-center gap-1.5 py-1 font-mono text-[11px] text-faint">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
              Mantle Testnet
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
