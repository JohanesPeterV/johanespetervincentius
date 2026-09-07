import { ThemeProvider } from '@/components/theme-provider';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { SITE_URL } from '@/lib/site';
import { DEFAULT_THEME_CSS, getThemeColorValues } from '@/lib/theme-colors';
import { DEFAULT_BASE_COLOR } from '@/registry/registry-base-colors';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

const getCssColor = (value: string) => `hsl(${value})`;

const configureViewportSettings = (): Viewport => ({
  themeColor: [
    {
      media: '(prefers-color-scheme: light)',
      color: getCssColor(
        getThemeColorValues(DEFAULT_BASE_COLOR.name, 'light').cssVars.primary,
      ),
    },
    {
      media: '(prefers-color-scheme: dark)',
      color: getCssColor(
        getThemeColorValues(DEFAULT_BASE_COLOR.name, 'dark').cssVars.primary,
      ),
    },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 2,
});

export const viewport = configureViewportSettings();

const FULL_NAME = 'Johanes Peter Vincentius';

const configureMetadata = (): Metadata => ({
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${FULL_NAME} - Software Engineer & Full Stack Developer`,
    template: `%s | ${FULL_NAME}`,
  },
  description: `${FULL_NAME} is a Software Engineer and Full Stack Developer specializing in React, Next.js, TypeScript, and modern web technologies. View portfolio, projects, and professional experience.`,
  keywords: [
    'Johanes Peter Vincentius',
    'Johanes Peter',
    'Johanes Vincentius',
    'software engineer',
    'full stack developer',
    'web developer',
    'react developer',
    'next.js developer',
    'typescript developer',
    'frontend developer',
    'portfolio',
  ],
  authors: [{ name: FULL_NAME, url: SITE_URL }],
  creator: FULL_NAME,
  publisher: FULL_NAME,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: FULL_NAME,
    title: `${FULL_NAME} - Software Engineer & Full Stack Developer`,
    description: `${FULL_NAME} is a Software Engineer and Full Stack Developer. View portfolio, projects, and professional experience.`,
  },
  twitter: {
    card: 'summary',
    title: `${FULL_NAME} - Software Engineer`,
    description: `Software Engineer and Full Stack Developer. React, Next.js, TypeScript.`,
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

const getJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: FULL_NAME,
  alternateName: ['Johanes Peter', 'Johanes Vincentius', 'Peter Vincentius'],
  url: SITE_URL,
  jobTitle: 'Software Engineer',
  description:
    'Software Engineer and Full Stack Developer specializing in React, Next.js, and TypeScript',
  sameAs: [
    'https://github.com/JohanesPeterV',
    'https://linkedin.com/in/johanes-vincentius-714b311a4',
  ],
  knowsAbout: [
    'React',
    'Next.js',
    'TypeScript',
    'JavaScript',
    'Full Stack Development',
    'Web Development',
    'Three.js',
    'TailwindCSS',
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{DEFAULT_THEME_CSS}</style>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getJsonLd()) }}
        />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} min-h-screen overflow-x-hidden bg-background font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
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
