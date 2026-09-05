import ContactIcons from './contact-icons';
import LinkButtons from './link-buttons';
import ProfileHeader from './profile-header';

export default function ClassicCard() {
  return (
    <div className="pointer-events-auto relative z-10 mx-auto flex w-full max-w-md flex-col items-center gap-6 px-6 py-4 text-foreground sm:gap-8 sm:px-8">
      <ProfileHeader />
      <LinkButtons />
      <ContactIcons />
    </div>
  );
}
