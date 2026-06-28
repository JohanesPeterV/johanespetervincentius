import ExploreSection from '@/app/_components/explore';
import LinktreeSection from '@/app/_components/linktree';
import MachineBackground from '@/components/backgrounds/machine-background';
import SnapScrollContainer from '@/components/snap-scroll-container';
import RandomColorButton from '@/components/theme-buttons/random-color-button';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full">
      <MachineBackground />
      <RandomColorButton
        aria-label="Shuffle theme colour"
        title="Shuffle theme colour"
        className="animate-fade-late fixed right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-2xl leading-none shadow-lg ring-1 ring-white/10 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 sm:text-2xl lg:text-2xl"
      />
      <SnapScrollContainer className="relative z-10">
        <LinktreeSection />
        <ExploreSection />
      </SnapScrollContainer>
    </div>
  );
}
