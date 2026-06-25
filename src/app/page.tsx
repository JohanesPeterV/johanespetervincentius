import ContactIcons from '@/app/_components/linktree/contact-icons';
import LinkButtons from '@/app/_components/linktree/link-buttons';
import ProfileHeader from '@/app/_components/linktree/profile-header';
import MachineExperience from '@/app/_components/machine-experience';

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden">
      <MachineExperience>
        <div className="card-harden flex w-[320px] flex-col items-center rounded-3xl border border-white/10 bg-card/80 p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
          <div className="card-text flex w-full flex-col items-center gap-6">
            <ProfileHeader />
            <LinkButtons />
            <ContactIcons />
          </div>
        </div>
      </MachineExperience>
    </main>
  );
}
