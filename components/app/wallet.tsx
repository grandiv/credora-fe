"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Wallet, LoaderCircle, Check, TriangleAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MANTLE } from "@/lib/contract";

/**
 * Real wallet connector (injected EIP-1193 / MetaMask) on Mantle Sepolia.
 * No extra deps — talks to window.ethereum directly. When connected, the
 * Register/Submit flows write on-chain through the user's wallet; when not
 * connected they fall back to the frictionless demo path.
 */
type Eth = {
  request: (a: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (e: string, cb: (...a: unknown[]) => void) => void;
  removeListener?: (e: string, cb: (...a: unknown[]) => void) => void;
};

function getEth(): Eth | undefined {
  return (globalThis as { ethereum?: Eth }).ethereum;
}

const CHAIN_HEX = "0x" + MANTLE.chainId.toString(16); // 5003 → 0x138b

async function switchToMantle(eth: Eth) {
  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_HEX }],
    });
  } catch (err) {
    // 4902 = chain not added yet → add it
    const code = (err as { code?: number })?.code;
    if (code === 4902) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: CHAIN_HEX,
            chainName: "Mantle Sepolia",
            nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
            rpcUrls: [MANTLE.rpcUrl || "https://rpc.sepolia.mantle.xyz"],
            blockExplorerUrls: [MANTLE.explorer],
          },
        ],
      });
    } else {
      throw err;
    }
  }
}

type WalletState = {
  address: string | null;
  chainId: number | null;
  connecting: boolean;
  hasWallet: boolean;
  isMantle: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const WalletCtx = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasWallet, setHasWallet] = useState(false);

  useEffect(() => {
    const eth = getEth();
    setHasWallet(Boolean(eth));
    if (!eth) return;
    // stay logged out across navigation/reload after an explicit disconnect
    const dismissed =
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem("credora.wallet.disconnected") === "1";
    // reflect already-authorised accounts without prompting (unless dismissed)
    if (!dismissed) {
      eth.request({ method: "eth_accounts" }).then((a) => {
        const acc = (a as string[])?.[0];
        if (acc) setAddress(acc);
      });
    }
    eth.request({ method: "eth_chainId" }).then((c) =>
      setChainId(parseInt(c as string, 16)),
    );
    const onAccounts = (...a: unknown[]) => {
      const acc = ((a[0] as string[]) ?? [])[0] ?? null;
      // a real account switch in MetaMask counts as a re-connect
      if (acc) sessionStorage.removeItem("credora.wallet.disconnected");
      setAddress(acc);
    };
    const onChain = (...a: unknown[]) =>
      setChainId(parseInt(a[0] as string, 16));
    eth.on?.("accountsChanged", onAccounts);
    eth.on?.("chainChanged", onChain);
    return () => {
      eth.removeListener?.("accountsChanged", onAccounts);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, []);

  const connect = useCallback(async () => {
    const eth = getEth();
    setError(null);
    if (!eth) {
      setError("No wallet found — install MetaMask to connect.");
      return;
    }
    setConnecting(true);
    try {
      const accounts = (await eth.request({
        method: "eth_requestAccounts",
      })) as string[];
      await switchToMantle(eth);
      const c = (await eth.request({ method: "eth_chainId" })) as string;
      sessionStorage.removeItem("credora.wallet.disconnected");
      setAddress(accounts[0] ?? null);
      setChainId(parseInt(c, 16));
    } catch (err) {
      setError(
        (err as { message?: string })?.message ?? "Failed to connect wallet.",
      );
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    // MetaMask keeps the site authorised, so clear local state + remember the
    // choice so we don't silently re-connect on the next mount/navigation.
    sessionStorage.setItem("credora.wallet.disconnected", "1");
    setAddress(null);
    setError(null);
  }, []);

  return (
    <WalletCtx.Provider
      value={{
        address,
        chainId,
        connecting,
        hasWallet,
        isMantle: chainId === MANTLE.chainId,
        error,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletCtx.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletCtx);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

function short(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function WalletButton() {
  const { address, connecting, connect, disconnect, isMantle } = useWallet();

  return (
    <button
      onClick={address ? disconnect : connect}
      title={address ? "Click to disconnect" : "Connect your wallet"}
      className="group inline-flex items-center gap-2 rounded-xl border border-slate-line/70 bg-white/[0.03] px-3.5 py-2 font-mono text-[12px] text-ink transition-colors hover:bg-white/[0.07]"
    >
      <AnimatePresence mode="wait" initial={false}>
        {connecting ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-muted"
          >
            <LoaderCircle className="h-3.5 w-3.5 animate-spin text-cyan" />
            Connecting…
          </motion.span>
        ) : address ? (
          <motion.span
            key="connected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            {isMantle ? (
              <span className="grid h-4 w-4 place-items-center rounded-full bg-cyan/15">
                <Check className="h-2.5 w-2.5 text-cyan" strokeWidth={3} />
              </span>
            ) : (
              <TriangleAlert className="h-3.5 w-3.5 text-[#e36a5a]" />
            )}
            {isMantle ? short(address) : "Wrong network"}
          </motion.span>
        ) : (
          <motion.span
            key="connect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Wallet className="h-3.5 w-3.5 text-cyan" />
            Connect Wallet
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
