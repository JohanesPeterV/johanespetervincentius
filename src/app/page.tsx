import ContactIcons from '@/app/_components/linktree/contact-icons';
import LinkButtons from '@/app/_components/linktree/link-buttons';
import ProfileHeader from '@/app/_components/linktree/profile-header';
import MachineBackground from '@/components/backgrounds/machine-background';

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center px-4 py-16">
      <MachineBackground />
      <div className="relative flex w-full max-w-md flex-col items-center gap-8">
        <ProfileHeader />
        <LinkButtons />
        <ContactIcons />
      </div>
    </main>
  );
}
