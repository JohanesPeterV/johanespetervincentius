import LinktreeSection from '@/app/_components/linktree';
import DiveScene from '@/components/dive/dive-scene';

export default function Home() {
  return (
    <main className="group relative h-screen w-full overflow-hidden [&_[data-visible]:first-child]:!invisible">
      <DiveScene appearance="coffee" tierOverride={null} />
      <div className="pointer-events-none fixed inset-0 z-20 flex translate-y-6 scale-[0.97] items-center justify-center opacity-0 transition-[opacity,transform] duration-1000 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] group-has-[[data-visible=true]:first-child]:translate-y-0 group-has-[[data-visible=true]:first-child]:scale-100 group-has-[[data-visible=true]:first-child]:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:transition-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        <LinktreeSection />
      </div>
    </main>
  );
}
