import LinktreeSection from '@/app/_components/linktree';
import DiveScene from '@/components/dive/dive-scene';
import RandomColorButton from '@/components/theme-buttons/random-color-button';

export default function Home() {
  return (
    <main className="group relative h-screen w-full overflow-hidden [&_[data-visible]:first-child]:!invisible">
      <DiveScene appearance="space" tierOverride={null} />
      <div className="pointer-events-none fixed inset-0 z-20 flex translate-y-6 scale-[0.97] items-center justify-center opacity-0 transition-[opacity,transform] duration-1000 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] group-has-[[data-visible=true]:first-child]:translate-y-0 group-has-[[data-visible=true]:first-child]:scale-100 group-has-[[data-visible=true]:first-child]:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:transition-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        <LinktreeSection />
      </div>
      <RandomColorButton
        aria-label="Shuffle theme colour"
        title="Shuffle theme colour"
        className="animate-fade-late fixed right-5 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-2xl leading-none shadow-lg ring-1 ring-white/10 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 sm:text-2xl lg:text-2xl"
      />
    </main>
  );
}
