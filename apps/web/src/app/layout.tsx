import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SkipToContent } from '@/components/common/SkipToContent';
import { AppProviders } from '@/components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'KeySmasher — Touch Typing Academy, Practice & Competitions',
  description:
    'KeySmasher is a production-minded touch typing learning academy, customizable speed testing engine, developer syntax drills, and real-time multiplayer competition arena.',
  manifest: '/manifest.json',
  keywords: [
    'typing test',
    'touch typing',
    'typing academy',
    'typing competition',
    'monkeytype alternative',
    'wpm test',
    'realtime typing race',
    'code typing practice',
  ],
  authors: [{ name: 'KeySmasher Team' }],
  openGraph: {
    title: 'KeySmasher — Touch Typing Academy & Multiplayer Arena',
    description:
      'High-speed touch typing academy, developer syntax practice, and real-time multiplayer racing arena.',
    siteName: 'KeySmasher',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KeySmasher — Touch Typing Academy & Multiplayer Arena',
    description:
      'High-speed touch typing academy, developer syntax practice, and real-time multiplayer racing arena.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#090d16',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="dark"
      style={{ colorScheme: 'dark', backgroundColor: '#090d16' }}
    >
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#090d16" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body
        style={{ colorScheme: 'dark', backgroundColor: '#090d16' }}
        className="flex min-h-screen flex-col bg-background font-sans text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200"
      >
        <AppProviders>
          <SkipToContent />
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
