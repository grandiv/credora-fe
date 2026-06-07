import { Nav } from "@/components/Nav";
import { ScrollProgress } from "@/components/ScrollProgress";
import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { HowItWorks } from "@/components/HowItWorks";
import { Arena } from "@/components/Arena";
import { LiveAgents } from "@/components/LiveAgents";
import { Tracks } from "@/components/Tracks";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative overflow-x-clip">
      <Nav />
      <ScrollProgress />
      <Hero />
      <Problem />
      <HowItWorks />
      <Arena />
      <LiveAgents />
      <Tracks />
      <CTA />
      <Footer />
    </main>
  );
}
