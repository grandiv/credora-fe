/**
 * ─────────────────────────────────────────────────────────────────────────
 *  Chain writes (viem) — REAL contract calls to Mantle Sepolia
 * ─────────────────────────────────────────────────────────────────────────
 *  Dynamically imported only when the user has a wallet connected, so viem
 *  never loads in the default no-wallet demo. The user signs + pays gas; the
 *  backend indexer ingests the resulting events (AgentRegistered /
 *  DecisionSubmitted) within ~15s, so the agent/decision then appears in the
 *  app automatically — no backend write needed.
 * ─────────────────────────────────────────────────────────────────────────
 */

import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  keccak256,
  stringToBytes,
  decodeEventLog,
  type Hex,
} from "viem";
import { CONTRACTS, MANTLE } from "./contract";
import type { RegisterAgentInput, LogDecisionInput, TxResult } from "./contract";
import {
  AGENT_PASSPORT_ABI,
  SEASON_MANAGER_ABI,
  DECISION_LOGGER_ABI,
} from "./abi";

type Eth = {
  request: (a: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function getInjected(): Eth {
  const eth = (globalThis as { ethereum?: Eth }).ethereum;
  if (!eth)
    throw new Error(
      "No wallet found. Install MetaMask and connect to Mantle Sepolia.",
    );
  return eth;
}

const mantleSepolia = {
  id: MANTLE.chainId,
  name: "Mantle Sepolia",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: { http: [MANTLE.rpcUrl || "https://rpc.sepolia.mantle.xyz"] },
  },
  blockExplorers: { default: { name: "Mantle Explorer", url: MANTLE.explorer } },
} as const;

function publicClient() {
  return createPublicClient({ chain: mantleSepolia, transport: http() });
}

async function walletClient() {
  const eth = getInjected();
  const [account] = (await eth.request({
    method: "eth_requestAccounts",
  })) as Hex[];
  if (!account) throw new Error("Wallet not connected.");
  // make sure the wallet is on Mantle Sepolia before signing
  const chainHex = (await eth.request({ method: "eth_chainId" })) as string;
  if (parseInt(chainHex, 16) !== MANTLE.chainId) {
    throw new Error("Wrong network — switch your wallet to Mantle Sepolia.");
  }
  return {
    account,
    client: createWalletClient({
      account,
      chain: mantleSepolia,
      transport: custom(eth),
    }),
  };
}

function requireAddress(addr: string, label: string): Hex {
  if (!addr) throw new Error(`${label} address not configured.`);
  return addr as Hex;
}

const ACTION_INDEX: Record<string, number> = { BUY: 0, SELL: 1, HOLD: 2 };

/** Register an agent passport — minted to the connected wallet. */
export async function chainRegisterAgent(
  input: RegisterAgentInput,
): Promise<TxResult> {
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
      account, // operator = connected wallet (authorises future submitDecision)
      keccak256(stringToBytes(input.strategy)),
    ],
  });

  // wait for confirmation, then parse the AgentRegistered event for the id
  let agentId: string | undefined;
  try {
    const receipt = await publicClient().waitForTransactionReceipt({
      hash: txHash,
    });
    for (const log of receipt.logs) {
      try {
        const ev = decodeEventLog({
          abi: AGENT_PASSPORT_ABI,
          data: log.data,
          topics: log.topics,
        });
        if (ev.eventName === "AgentRegistered") {
          agentId = String((ev.args as { agentId: bigint }).agentId);
          break;
        }
      } catch {
        /* not our event */
      }
    }
  } catch {
    /* receipt wait failed — tx still submitted */
  }

  return { agentId, txHash, status: "verified" };
}

export async function chainJoinSeason(
  agentId: string,
  seasonId: string,
): Promise<TxResult> {
  const address = requireAddress(CONTRACTS.seasonManager, "SeasonManager");
  const { client } = await walletClient();
  const txHash = await client.writeContract({
    address,
    abi: SEASON_MANAGER_ABI,
    functionName: "joinSeason",
    args: [BigInt(seasonId.replace(/\D/g, "") || "1"), BigInt(agentId)],
  });
  return { txHash, status: "verified" };
}

export async function chainLogDecision(
  input: LogDecisionInput,
): Promise<TxResult> {
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
      keccak256(
        stringToBytes(JSON.stringify({ m: input.market, c: input.confidence })),
      ),
      keccak256(stringToBytes(input.rationale || "rationale")),
      "",
    ],
  });
  return { txHash, status: "verified" };
}

/** Is the connected wallet allowed to submit decisions for this agent? */
export async function chainIsAuthorized(
  agentId: string,
  caller: string,
): Promise<boolean> {
  if (!CONTRACTS.agentPassport) return false;
  try {
    return (await publicClient().readContract({
      address: CONTRACTS.agentPassport as Hex,
      abi: AGENT_PASSPORT_ABI,
      functionName: "isAuthorizedOperator",
      args: [BigInt(agentId), caller as Hex],
    })) as boolean;
  } catch {
    return false;
  }
}
