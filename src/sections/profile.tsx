'use client';
import Links from '@/components/links';
import RandomColorButton from '@/components/theme-buttons/random-color-button';
import { useTheme } from 'next-themes';

export default function Profile() {
  const { resolvedTheme } = useTheme();
  const themeMode = (resolvedTheme as 'light' | 'dark') ?? 'dark';

  return (
    <div className="flex flex-col justify-center space-y-5">
      <div
        className={`
      text-transparent bg-gradient-to-r 
      ${themeMode === 'dark' && 'from-blue-500 via-purple-500 to-pink-500'}
      ${themeMode === 'light' && 'from-blue-400 via-purple-400 to-pink-400'}
      animate-gradient  bg-clip-text
      sm:text-left text-center
      sm:space-y-0 space-y-3
  `}
      >
        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight p-0">
          J
          <RandomColorButton className="text-3xl sm:text-4xl lg:text-6xl font-extrabold p-0" />
          hanes Peter Vincentius
        </h1>
        <h2 className="text-lg sm:text-xl tracking-tight lg:text-2xl p-0">
          Software Engineer
        </h2>
      </div>
      <div className="w-full flex sm:justify-start justify-center">
        <Links iconSize={40} />
      </div>
    </div>
  );
}
