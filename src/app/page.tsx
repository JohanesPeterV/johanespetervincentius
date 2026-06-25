import ContactIcons from '@/app/_components/linktree/contact-icons';
import LinkButtons from '@/app/_components/linktree/link-buttons';
import ProfileHeader from '@/app/_components/linktree/profile-header';
import MachineExperience from '@/app/_components/machine-experience';

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden">
      <MachineExperience>
        <div className="flex w-[360px] flex-col items-center gap-8 rounded-3xl border border-white/10 bg-card/70 p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
          <ProfileHeader />
          <LinkButtons />
          <ContactIcons />
        </div>
      </MachineExperience>
    </main>
  );
}
