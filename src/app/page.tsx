import ContactIcons from '@/app/_components/linktree/contact-icons';
import LinkButtons from '@/app/_components/linktree/link-buttons';
import ProfileHeader from '@/app/_components/linktree/profile-header';
import MachineBackground from '@/components/backgrounds/machine-background';
import RandomColorButton from '@/components/theme-buttons/random-color-button';

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center px-4 py-16">
      <MachineBackground />
      <RandomColorButton
        aria-label="Shuffle theme colour"
        title="Shuffle theme colour"
        className="animate-fade-late fixed right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-2xl leading-none shadow-lg ring-1 ring-white/10 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 sm:text-2xl lg:text-2xl"
      />
      <div className="animate-card-in relative z-10 w-full max-w-md">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-2 rounded-[2.25rem] bg-primary/10 opacity-50 blur-2xl"
        />
        <div className="relative flex flex-col items-center gap-8 overflow-hidden rounded-3xl border border-white/15 bg-black/60 p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 via-white/0 to-transparent"
          />
          <div className="relative z-10 flex w-full flex-col items-center gap-8">
            <ProfileHeader />
            <LinkButtons />
            <ContactIcons />
          </div>
        </div>
      </div>
    </main>
  );
}
