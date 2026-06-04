"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Wallet, LoaderCircle, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type WalletState = {
  address: string | null;
  connecting: boolean;
  connect: () => void;
  disconnect: () => void;
};

const MOCK_ADDRESS = "0x12A4…3aF9";

const WalletCtx = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connect = () => {
    setConnecting(true);
    setTimeout(() => {
      setAddress(MOCK_ADDRESS);
      setConnecting(false);
    }, 900);
  };
  const disconnect = () => setAddress(null);

  return (
    <WalletCtx.Provider value={{ address, connecting, connect, disconnect }}>
      {children}
    </WalletCtx.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletCtx);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

export function WalletButton() {
  const { address, connecting, connect, disconnect } = useWallet();

  return (
    <button
      onClick={address ? disconnect : connect}
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
            <span className="grid h-4 w-4 place-items-center rounded-full bg-cyan/15">
              <Check className="h-2.5 w-2.5 text-cyan" strokeWidth={3} />
            </span>
            {address}
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
