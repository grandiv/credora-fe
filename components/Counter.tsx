"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function Counter({
  to,
  decimals = 0,
  duration = 1600,
  prefix = "",
  suffix = "",
}: {
  to: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useRef(false);
  const valRef = useRef(0); // latest displayed value (for animating from)
  const toRef = useRef(to); // latest target (avoids stale closure in IO)
  const rafRef = useRef(0);

  useEffect(() => {
    valRef.current = val;
  });
  useEffect(() => {
    toRef.current = to;
  }, [to]);

  const animate = useCallback(
    (target: number) => {
      cancelAnimationFrame(rafRef.current);
      const from = valRef.current;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(from + (target - from) * eased);
        if (p < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [duration],
  );

  // first reveal — animate to whatever the current target is
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !visible.current) {
          visible.current = true;
          animate(toRef.current);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [animate]);

  // re-animate when the target changes after the first reveal (e.g. live data
  // arrives after the card mounted at 0)
  useEffect(() => {
    if (visible.current) animate(to);
  }, [to, animate]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {val.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
