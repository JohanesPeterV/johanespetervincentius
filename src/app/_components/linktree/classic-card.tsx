import ContactIcons from './contact-icons';
import LinkButtons from './link-buttons';
import ProfileHeader from './profile-header';

export default function ClassicCard() {
  return (
    <div className="pointer-events-auto relative z-10 mx-auto w-full max-w-xl px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex w-full flex-col items-start gap-7 [@media(max-height:640px)]:gap-3">
        <ProfileHeader />
        <LinkButtons />
        <ContactIcons />
      </div>
    </div>
  );
}
