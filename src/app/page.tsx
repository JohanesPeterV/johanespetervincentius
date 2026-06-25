import ContactIcons from '@/app/_components/linktree/contact-icons';
import LinkButtons from '@/app/_components/linktree/link-buttons';
import ProfileHeader from '@/app/_components/linktree/profile-header';
import MachineExperience from '@/app/_components/machine-experience';

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden">
      <MachineExperience>
        <div className="flex w-[320px] flex-col items-center gap-6 rounded-3xl border border-white/10 bg-black/30 p-8 text-center backdrop-blur-md">
          <ProfileHeader />
          <LinkButtons />
          <ContactIcons />
        </div>
      </MachineExperience>
    </main>
  );
}
