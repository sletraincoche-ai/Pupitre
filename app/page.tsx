import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ProblemSection } from "@/components/landing/problem-section";
import { SolutionSection } from "@/components/landing/solution-section";
import { DemoPiloteSection } from "@/components/landing/demo-pilote";
import { CopiloteSection } from "@/components/landing/copilote-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { CookieBanner } from "@/components/landing/cookie-banner";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <DemoPiloteSection />
        <CopiloteSection />
        <PricingSection />
        <TestimonialsSection />
        <FinalCta />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
