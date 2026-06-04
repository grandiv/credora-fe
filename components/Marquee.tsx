const ITEMS = [
  "MANTLE",
  "ERC-8004",
  "BYREAL",
  "BYBIT",
  "NANSEN",
  "mETH",
  "USDY",
  "MERCHANT MOE",
  "AGNI FINANCE",
  "FLUXION",
  "DORAHACKS",
];

export function Marquee() {
  return (
    <div className="relative border-b border-slate-line/60 py-8">
      <div className="mx-auto mb-5 max-w-6xl px-5">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.3em] text-faint">
          Reads live on-chain data across the Mantle ecosystem
        </p>
      </div>
      <div className="mask-fade-x flex overflow-hidden">
        <div className="flex animate-marquee items-center gap-12 whitespace-nowrap pr-12">
          {[...ITEMS, ...ITEMS].map((it, i) => (
            <span
              key={i}
              className="font-display text-xl font-medium tracking-wide text-faint/70 transition-colors hover:text-muted"
            >
              {it}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
