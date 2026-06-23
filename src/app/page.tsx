import ContactIcons from '@/app/_components/linktree/contact-icons';
import LinkButtons from '@/app/_components/linktree/link-buttons';
import ProfileHeader from '@/app/_components/linktree/profile-header';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full justify-center bg-background px-4 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <ProfileHeader />
        <LinkButtons />
        <ContactIcons />
      </div>
    </main>
  );
}
