import ExploreSection from '@/app/_components/explore';
import LinktreeSection from '@/app/_components/linktree';
import MachineBackground from '@/components/backgrounds/machine-background';
import WorldTwoBackground from '@/components/backgrounds/world-two-background';
import SnapScrollContainer from '@/components/snap-scroll-container';
import RandomColorButton from '@/components/theme-buttons/random-color-button';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full">
      <MachineBackground />
      <WorldTwoBackground />
      <div
        aria-hidden
        className="world-fog pointer-events-none fixed inset-0 z-[6]"
      >
        <div className="absolute inset-0 backdrop-blur-2xl" />
        <div className="world-fog-billow absolute inset-0 bg-gradient-to-t from-white via-white/55 to-transparent" />
      </div>
      <svg
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 h-0 w-0"
      >
        <filter
          id="fog-warp"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.006 0.009"
            numOctaves={2}
            seed={7}
            result="fognoise"
          >
            <animate
              attributeName="baseFrequency"
              dur="22s"
              values="0.006 0.009;0.009 0.006;0.006 0.009"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="fognoise"
            scale={90}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
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
