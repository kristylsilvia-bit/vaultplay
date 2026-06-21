import type { Metadata, Viewport } from 'next';
import { Inter, Sora } from 'next/font/google';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Providers } from '@/components/Providers';
import { noFlashThemeScript } from '@/store/theme';
import { totalGames } from '@/lib/games';
import './globals.css';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gamejet.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Gamejet — Play 700+ Free Browser Games',
    template: '%s · Gamejet',
  },
  description: `Play ${totalGames}+ free browser games instantly — no sign-up, no downloads. Arcade, racing, shooters, puzzles and more.`,
  keywords: ['free games', 'browser games', 'online games', 'play games', 'arcade'],
  applicationName: 'Gamejet',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    siteName: 'Gamejet',
    title: 'Gamejet — Play 700+ Free Browser Games',
    description: 'Hundreds of free browser games, instantly playable. No sign-up required.',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gamejet — Play 700+ Free Browser Games',
    description: 'Hundreds of free browser games, instantly playable.',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0c12' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body className={`${sans.variable} ${display.variable} font-sans`}>
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
