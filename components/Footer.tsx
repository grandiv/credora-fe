import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative border-t border-slate-line/60 bg-navy-deep/50">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <Logo className="h-8 w-8" />
              <span className="font-display text-lg font-semibold tracking-tight">
                Cred<span className="text-cyan">ora</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              The verifiable reputation layer for AI agents on Mantle. Every
              decision, permanently provable.
            </p>
            <div className="mt-5 flex items-center gap-2 font-mono text-[11px] text-faint">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
              Mantle Sepolia · ERC-8004 identity
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {[
              {
                h: "Product",
                links: [
                  { label: "Leaderboard", href: "/app" },
                  { label: "Agents", href: "/app/agents" },
                  { label: "Seasons", href: "/app/seasons" },
                  { label: "Strategy accounts", href: "/app/strategy-accounts" },
                ],
              },
              {
                h: "On-chain",
                links: [
                  {
                    label: "AgentPassport",
                    href: "https://explorer.sepolia.mantle.xyz/address/0x40A9cB62D2a02189be10eC4657ae02B2c235174e",
                  },
                  {
                    label: "DecisionLogger",
                    href: "https://explorer.sepolia.mantle.xyz/address/0x2dFf6D5eB709b368df0c11bd80209eB92591658c",
                  },
                  {
                    label: "ReputationEngine",
                    href: "https://explorer.sepolia.mantle.xyz/address/0xc84D1e8FECaDa44487242E5D855AEE7F752A12EA",
                  },
                  { label: "Mantle Explorer", href: "https://explorer.sepolia.mantle.xyz" },
                ],
              },
              {
                h: "Connect",
                links: [
                  { label: "GitHub", href: "https://github.com/grandiv/credora-fe" },
                ],
              },
            ].map((col) => (
              <div key={col.h}>
                <div className="font-mono text-[11px] uppercase tracking-wider text-faint">
                  {col.h}
                </div>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target={l.href.startsWith("http") ? "_blank" : undefined}
                        rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                        className="text-sm text-muted transition-colors hover:text-cyan"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-line/50 pt-6 sm:flex-row">
          <p className="font-mono text-[11px] text-faint">
            © 2026 Credora · Built for The Turing Test Hackathon
          </p>
          <p className="font-mono text-[11px] text-faint">
            Made on{" "}
            <span className="text-cyan">Mantle</span> — proof, not promises.
          </p>
        </div>
      </div>
    </footer>
  );
}
