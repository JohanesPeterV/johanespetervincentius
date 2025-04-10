import { ThemeProvider } from '@/components/theme-provider';
import { ThemeSwitcher } from '@/components/theme-switcher';
import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-poppins',
});

const configureViewportSettings = (): Viewport => ({
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 2,
});

export const viewport = configureViewportSettings();

const configureMetadata = (): Metadata => ({
  title: 'Johanes Peter Vincentius',
  description:
    'Personal portfolio website by Johanes Peter Vincentius - Software Engineer and Full Stack Developer',
  keywords: [
    'software developer',
    'web developer',
    'full stack',
    'react developer',
    'portfolio',
  ],
  authors: [{ name: 'Johanes Peter Vincentius' }],
  openGraph: {
    type: 'website',
    url: 'https://johanespetervincentius.my.id',
    title: 'Johanes Peter Vincentius - Portfolio',
    description: 'Software Engineer and Full Stack Developer',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
  },
});

export const metadata = configureMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`
          ${poppins.variable} antialiased font-poppins overflow-x-hidden min-h-screen bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ThemeSwitcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
