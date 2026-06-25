import ContactIcons from '@/app/_components/linktree/contact-icons';
import LinkButtons from '@/app/_components/linktree/link-buttons';
import ProfileHeader from '@/app/_components/linktree/profile-header';
import ScrollCue from '@/app/_components/linktree/scroll-cue';
import MachineBackground from '@/components/backgrounds/machine-background';

export default function Home() {
  return (
    <main className="relative flex w-full flex-col items-center">
      <MachineBackground />
      <section className="flex min-h-screen w-full flex-col items-center justify-between px-4 py-16">
        <ProfileHeader />
        <ScrollCue />
      </section>
      <section className="flex min-h-screen w-full max-w-md flex-col items-center justify-center px-4">
        <LinkButtons />
      </section>
      <section className="flex min-h-[70vh] w-full flex-col items-center justify-center px-4 pb-20">
        <ContactIcons />
      </section>
    </main>
  );
}
