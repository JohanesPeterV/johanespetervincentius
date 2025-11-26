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

const SITE_URL = 'https://johanespetervincentius.my.id';
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
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: FULL_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${FULL_NAME} - Software Engineer`,
    description: `Software Engineer and Full Stack Developer. React, Next.js, TypeScript.`,
    images: ['/og-image.png'],
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
  image: `${SITE_URL}/og-image.png`,
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
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getJsonLd()) }}
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
