import ContactIcons from '@/app/_components/linktree/contact-icons';
import LinkButtons from '@/app/_components/linktree/link-buttons';
import ProfileHeader from '@/app/_components/linktree/profile-header';
import MachineExperience from '@/app/_components/machine-experience';

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden">
      <MachineExperience>
        <div className="card-text flex w-[300px] flex-col items-center gap-6 p-6">
          <ProfileHeader />
          <LinkButtons />
          <ContactIcons />
        </div>
      </MachineExperience>
    </main>
  );
}
