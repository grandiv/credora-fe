/**
 * ─────────────────────────────────────────────────────────────────────────
 *  Chain writes (viem) — REAL contract calls to Mantle Sepolia
 * ─────────────────────────────────────────────────────────────────────────
 *  Dynamically imported only when WRITE_SOURCE="chain", so viem never loads
 *  in the default mock demo. These are ready to run but require:
 *    1. deployed contract addresses in NEXT_PUBLIC_* env (CONTRACTS)
 *    2. an injected wallet (window.ethereum) on Mantle Sepolia
 *  Until both exist they throw a clear, actionable error.
 *  ⚠ Not yet end-to-end tested — contracts are not deployed (see CONTEXT doc).
 * ─────────────────────────────────────────────────────────────────────────
 */

import {
  createWalletClient,
  custom,
  keccak256,
  stringToBytes,
  toHex,
  type Hex,
} from "viem";
import { CONTRACTS, MANTLE } from "./contract";
import type { RegisterAgentInput, LogDecisionInput, TxResult } from "./contract";
import {
  AGENT_PASSPORT_ABI,
  SEASON_MANAGER_ABI,
  DECISION_LOGGER_ABI,
} from "./abi";

type Eth = { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> };

function getInjected(): Eth {
  const eth = (globalThis as { ethereum?: Eth }).ethereum;
  if (!eth) throw new Error("No wallet found. Install MetaMask and connect to Mantle Sepolia.");
  return eth;
}

const mantleSepolia = {
  id: MANTLE.chainId,
  name: "Mantle Sepolia",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: { default: { http: [MANTLE.rpcUrl || "https://rpc.sepolia.mantle.xyz"] } },
  blockExplorers: { default: { name: "Mantle Explorer", url: MANTLE.explorer } },
} as const;

async function walletClient() {
  const eth = getInjected();
  const [account] = (await eth.request({ method: "eth_requestAccounts" })) as Hex[];
  if (!account) throw new Error("Wallet not connected.");
  return {
    account,
    client: createWalletClient({ account, chain: mantleSepolia, transport: custom(eth) }),
  };
}

function requireAddress(addr: string, label: string): Hex {
  if (!addr) throw new Error(`${label} address not set — deploy the contract and set its NEXT_PUBLIC_* env.`);
  return addr as Hex;
}

const ACTION_INDEX: Record<string, number> = { BUY: 0, SELL: 1, HOLD: 2 };

export async function chainRegisterAgent(input: RegisterAgentInput): Promise<TxResult> {
  const address = requireAddress(CONTRACTS.agentPassport, "AgentPassport");
  const { account, client } = await walletClient();
  const txHash = await client.writeContract({
    address,
    abi: AGENT_PASSPORT_ABI,
    functionName: "registerAgent",
    args: [
      input.name,
      input.strategy,
      "", // metadataURI — optional IPFS/backend URL
      account, // operator = connected wallet (authorizes future submitDecision)
      keccak256(stringToBytes(input.strategy)),
    ],
  });
  // agentId is read back from the AgentRegistered event by the caller via receipt
  return { txHash, status: "verified" };
}

export async function chainJoinSeason(agentId: string, seasonId: string): Promise<TxResult> {
  const address = requireAddress(CONTRACTS.seasonManager, "SeasonManager");
  const { client } = await walletClient();
  const txHash = await client.writeContract({
    address,
    abi: SEASON_MANAGER_ABI,
    functionName: "joinSeason",
    args: [BigInt(seasonId), BigInt(agentId)],
  });
  return { txHash, status: "verified" };
}

export async function chainLogDecision(input: LogDecisionInput): Promise<TxResult> {
  const address = requireAddress(CONTRACTS.decisionLogger, "DecisionLogger");
  const { client } = await walletClient();
  const windowSeconds = BigInt(parseInt(input.window, 10) * 3600 || 86400);
  const txHash = await client.writeContract({
    address,
    abi: DECISION_LOGGER_ABI,
    functionName: "submitDecision",
    args: [
      BigInt(input.agentId),
      BigInt(input.seasonId.replace(/\D/g, "") || "1"),
      keccak256(stringToBytes(input.market)),
      ACTION_INDEX[input.action] ?? 2,
      input.confidence,
      input.riskScore,
      windowSeconds,
      keccak256(stringToBytes(JSON.stringify({ m: input.market, c: input.confidence }))),
      keccak256(stringToBytes(input.rationale || "rationale")),
      "",
    ],
  });
  return { txHash, status: "verified" };
}

export { toHex };
