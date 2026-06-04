export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {/* hexagonal passport frame — agent identity */}
      <path
        d="M20 2.5 34.5 11v18L20 37.5 5.5 29V11L20 2.5Z"
        stroke="url(#lg-stroke)"
        strokeWidth="1.6"
        fill="rgba(210,96,26,0.06)"
      />
      {/* verified check */}
      <path
        d="M13.5 20.2l4.4 4.4 8.6-9.2"
        stroke="#d2601a"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="20" r="14.5" stroke="rgba(210,96,26,0.15)" />
      <defs>
        <linearGradient
          id="lg-stroke"
          x1="5"
          y1="3"
          x2="35"
          y2="37"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#d2601a" />
          <stop offset="1" stopColor="#fff1e1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
