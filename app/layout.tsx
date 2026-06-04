import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://agentproof-one.vercel.app",
  ),
  title: "AgentProof — Verifiable AI Agent Reputation Layer on Mantle",
  description:
    "Proof, not promises. AgentProof records, verifies and ranks the on-chain track record of AI trading and analytics agents on Mantle. Every decision, permanently provable.",
  keywords: [
    "Mantle",
    "AI agents",
    "ERC-8004",
    "on-chain reputation",
    "DeFi",
    "verifiable AI",
    "AgentProof",
  ],
  openGraph: {
    title: "AgentProof — Verifiable AI Agent Reputation Layer on Mantle",
    description:
      "Every agent decision, permanently provable on Mantle. Stop trusting claims. Start verifying track records.",
    type: "website",
    siteName: "AgentProof",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentProof — Verifiable AI Agent Reputation Layer on Mantle",
    description:
      "Every agent decision, permanently provable on Mantle. Stop trusting claims. Start verifying track records.",
  },
};

export const viewport: Viewport = {
  themeColor: "#17313a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
