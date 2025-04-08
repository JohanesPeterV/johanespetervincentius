import { ThemeProvider } from '@/components/theme-provider';
import { ThemeSwitcher } from '@/components/theme-switcher';
import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'], // Adjust weights as needed
  variable: '--font-poppins', // Creates a CSS variable
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
  description: 'Personal portfolio website by Johanes Peter Vincentius',
  robots: {
    index: true,
    follow: true,
  },
  // App install banner metadata
  manifest: '/manifest.json',
  // Disable non-essential third-party resources for privacy/perf
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
  },
});

export const metadata = configureMetadata();

const getHardwareAccelerationStyles = () => ({
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
  width: '100vw',
  height: '100vh',
  overflowX: 'hidden',
  overflowY: 'auto',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical assets */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`
          ${poppins.variable} antialiased font-poppins overflow-x-hidden min-h-screen bg-background`}
        style={getHardwareAccelerationStyles()}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          // Force immediate theme application to reduce layout shift
          disableTransitionOnChange
        >
          {children}
          <ThemeSwitcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
