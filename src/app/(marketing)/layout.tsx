import type { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { SiteFooter } from '@/components/landing/SiteFooter';

export const metadata: Metadata = {
  title: 'IntiDash - Dashboard financiero para Notion, Excel y workspaces',
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
