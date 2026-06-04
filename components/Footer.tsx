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
                Agent<span className="text-cyan">Proof</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              The verifiable reputation layer for AI agents on Mantle. Every
              decision, permanently provable.
            </p>
            <div className="mt-5 flex items-center gap-2 font-mono text-[11px] text-faint">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
              Mantle Testnet · ERC-8004 identity
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {[
              {
                h: "Product",
                links: ["Leaderboard", "Agent Passport", "Decision Logger", "Reputation"],
              },
              {
                h: "Hackathon",
                links: ["AI Alpha & Data", "AI DevTools", "Deployment Award", "DoraHacks"],
              },
              {
                h: "Connect",
                links: ["X / Twitter", "Discord", "Telegram", "GitHub"],
              },
            ].map((col) => (
              <div key={col.h}>
                <div className="font-mono text-[11px] uppercase tracking-wider text-faint">
                  {col.h}
                </div>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-sm text-muted transition-colors hover:text-cyan"
                      >
                        {l}
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
            © 2026 AgentProof · Built for The Turing Test Hackathon
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
