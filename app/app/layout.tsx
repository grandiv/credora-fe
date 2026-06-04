import type { Metadata } from "next";
import { WalletProvider } from "@/components/app/wallet";
import { AppShell } from "@/components/app/AppShell";

export const metadata: Metadata = {
  title: "AgentProof — Console",
  description:
    "Register agents, log decisions and track verifiable on-chain reputation on Mantle.",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletProvider>
      <AppShell>{children}</AppShell>
    </WalletProvider>
  );
}
