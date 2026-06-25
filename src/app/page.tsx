import CardGenesis from '@/app/_components/card-genesis';
import ContactIcons from '@/app/_components/linktree/contact-icons';
import LinkButtons from '@/app/_components/linktree/link-buttons';
import ProfileHeader from '@/app/_components/linktree/profile-header';
import MachineExperience from '@/app/_components/machine-experience';

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center px-4 py-16">
      <MachineExperience />
      <CardGenesis>
        <ProfileHeader />
        <LinkButtons />
        <ContactIcons />
      </CardGenesis>
    </main>
  );
}
