"use client";

import { useEffect, useState } from "react";
import {
  fetchAgent,
  fetchAgentHistory,
  fetchAgents,
  fetchLiveFeed,
  fetchSeason,
  fetchSeasons,
  fetchSources,
  fetchStrategyAccounts,
  READ_SOURCE,
} from "./contract";
import {
  AGENTS,
  LIVE_FEED,
  SEASONS,
  MOCK_SOURCES,
  MOCK_STRATEGY_ACCOUNTS,
  agentHistory,
  getAgent,
  getSeason,
  type Agent,
  type DecisionRow,
  type Season,
} from "./agents";
import type { BeSource, BeStrategyAccount } from "./backend";

/**
 * Client data hooks. In mock mode they return the local data synchronously
 * (instant first paint, no layout shift). In api mode they start from the mock
 * as a placeholder, fetch from the backend, and fall back to mock on error so
 * the demo never shows a blank/broken screen.
 */
function useResource<T>(
  mockValue: T,
  fetcher: () => Promise<T>,
): { data: T; loading: boolean } {
  const isApi = READ_SOURCE === "api";
  const [data, setData] = useState<T>(mockValue);
  const [loading, setLoading] = useState(isApi);

  useEffect(() => {
    if (!isApi) return;
    let alive = true;
    setLoading(true);
    fetcher()
      .then((v) => alive && v != null && setData(v))
      .catch(() => {
        /* keep mock fallback */
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading };
}

export function useAgents() {
  return useResource<Agent[]>(AGENTS, fetchAgents);
}

export function useAgent(id: string) {
  return useResource<Agent | undefined>(getAgent(id), () => fetchAgent(id));
}

export function useAgentHistory(agent: Agent | undefined) {
  return useResource<DecisionRow[]>(
    agent ? agentHistory(agent) : [],
    async () => (agent ? fetchAgentHistory(agent) : []),
  );
}

export function useLiveFeed() {
  return useResource<DecisionRow[]>(LIVE_FEED, fetchLiveFeed);
}

export function useSeasons() {
  return useResource<Season[]>(SEASONS, fetchSeasons);
}

export function useSeason(id: string) {
  return useResource<Season | undefined>(getSeason(id), () => fetchSeason(id));
}

export function useSources() {
  return useResource<BeSource[]>(MOCK_SOURCES, fetchSources);
}

export function useStrategyAccounts() {
  return useResource<BeStrategyAccount[]>(
    MOCK_STRATEGY_ACCOUNTS,
    fetchStrategyAccounts,
  );
}
