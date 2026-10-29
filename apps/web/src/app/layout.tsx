import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'KeySmasher — Touch Typing Academy, Practice & Competitions',
  description:
    'KeySmasher is a production-minded touch typing learning academy, customizable speed testing engine, and real-time multiplayer competition arena.',
  keywords: [
    'typing test',
    'touch typing',
    'typing academy',
    'typing competition',
    'monkeytype alternative',
    'wpm test',
    'realtime typing race',
  ],
  authors: [{ name: 'KeySmasher Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="flex min-h-screen flex-col bg-background font-sans text-slate-100">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
