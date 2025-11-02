'use client';
import Links from '@/components/links';
import RandomColorButton from '@/components/theme-buttons/random-color-button';
import { useTheme } from 'next-themes';

export default function Profile() {
  const { resolvedTheme } = useTheme();
  const themeMode = (resolvedTheme as 'light' | 'dark') ?? 'dark';

  return (
    <div className="flex flex-col justify-center min-h-screen px-4 sm:px-6">
      <div
        className={`
          text-transparent bg-gradient-to-r 
          ${themeMode === 'dark' && 'from-blue-500 via-purple-500 to-pink-500'}
          ${themeMode === 'light' && 'from-blue-400 via-purple-400 to-pink-400'}
          animate-gradient bg-clip-text
          flex flex-col gap-2 sm:gap-3
          text-center sm:text-left
        `}
      >
        <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight break-words">
          J
          <RandomColorButton className="text-2xl xs:text-3xl sm:text-4xl lg:text-6xl font-extrabold" />
          hanes Peter Vincentius
        </h1>
        <h2 className="text-base xs:text-lg sm:text-xl lg:text-2xl tracking-tight">
          Software Engineer
        </h2>
      </div>
      <div className="w-full flex justify-center sm:justify-start mt-6 sm:mt-8">
        <Links iconSize={32} />
      </div>
    </div>
  );
}
