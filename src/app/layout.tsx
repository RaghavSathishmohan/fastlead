import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'LeadFast — AI Lead Response for Construction',
  description: 'Instant AI-powered lead response for construction businesses. Never lose a lead again.',
  keywords: ['lead response', 'construction', 'AI', 'automation', 'contractor'],
  authors: [{ name: 'LeadFast' }],
  icons: {
    icon: '/logo-icon.svg',
    apple: '/logo-icon.svg'
  },
  openGraph: {
    title: 'LeadFast — AI Lead Response',
    description: 'Instant AI-powered lead response for construction businesses',
    type: 'website',
    images: [{
      url: '/logo-wordmark.svg',
      width: 1200,
      height: 512,
      alt: 'LeadFast — AI Lead Response'
    }]
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#050505'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
