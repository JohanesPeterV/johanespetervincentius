import DiveScene from '@/components/dive/dive-scene';
import RandomColorButton from '@/components/theme-buttons/random-color-button';

export default function Home() {
  return (
    <>
      <DiveScene appearance="space" tierOverride={null} />
      <RandomColorButton
        aria-label="Shuffle theme colour"
        title="Shuffle theme colour"
        className="animate-fade-late fixed right-5 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-2xl leading-none shadow-lg ring-1 ring-white/10 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 sm:text-2xl lg:text-2xl"
      />
    </>
  );
}
