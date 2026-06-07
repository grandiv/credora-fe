import type { Metadata } from "next";
import { WalletProvider } from "@/components/app/wallet";
import { SessionProvider } from "@/components/app/session";
import { AppShell } from "@/components/app/AppShell";

export const metadata: Metadata = {
  title: "Credora — Console",
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
      <SessionProvider>
        <AppShell>{children}</AppShell>
      </SessionProvider>
    </WalletProvider>
  );
}
