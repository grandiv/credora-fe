"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { DecisionRow } from "@/lib/agents";

/* Holds decisions logged during this browser session so the dashboard feed
   visibly reacts after a demo run. In-memory only (resets on refresh) —
   perfect for a live demo, no persistence complexity. */
type SessionState = {
  loggedDecisions: DecisionRow[];
  addDecision: (d: DecisionRow) => void;
  joinedSeasons: Record<string, string[]>; // seasonId -> agentIds
  joinSeason: (seasonId: string, agentId: string) => void;
};

const Ctx = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [loggedDecisions, setLogged] = useState<DecisionRow[]>([]);
  const [joinedSeasons, setJoined] = useState<Record<string, string[]>>({});

  const addDecision = (d: DecisionRow) =>
    setLogged((prev) => [d, ...prev].slice(0, 12));

  const joinSeason = (seasonId: string, agentId: string) =>
    setJoined((prev) => ({
      ...prev,
      [seasonId]: Array.from(new Set([...(prev[seasonId] ?? []), agentId])),
    }));

  return (
    <Ctx.Provider
      value={{ loggedDecisions, addDecision, joinedSeasons, joinSeason }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
