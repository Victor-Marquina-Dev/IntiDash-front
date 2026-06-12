import { Hero } from '@/components/landing/Hero';
import { TrustBanner } from '@/components/landing/TrustBanner';
import { BenefitsGrid } from '@/components/landing/BenefitsGrid';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { GoalsShowcase } from '@/components/landing/GoalsShowcase';
import { InsightsSection } from '@/components/landing/InsightsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { Testimonials } from '@/components/landing/Testimonials';
import { FaqSection } from '@/components/landing/FaqSection';
import { FinalCta } from '@/components/landing/FinalCta';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <TrustBanner />
      <BenefitsGrid />
      <DashboardPreview />
      <HowItWorks />
      <GoalsShowcase />
      <InsightsSection />
      <PricingSection />
      <Testimonials />
      <FaqSection />
      <FinalCta />
    </>
  );
}
