import ContactIcons from './contact-icons';
import LinkButtons from './link-buttons';
import ProfileHeader from './profile-header';

export default function ClassicCard() {
  return (
    <div className="pointer-events-auto relative z-10 mx-auto w-full max-w-md">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-[2.25rem] bg-foreground/5 opacity-50 blur-2xl"
      />
      <div className="relative flex flex-col items-center gap-8 overflow-hidden rounded-3xl border border-border/60 bg-background/55 p-6 text-foreground shadow-2xl ring-1 ring-foreground/5 backdrop-blur-2xl sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-foreground/5 to-transparent"
        />
        <div className="relative z-10 flex w-full flex-col items-center gap-4 sm:gap-8">
          <ProfileHeader />
          <LinkButtons />
          <ContactIcons />
        </div>
      </div>
    </div>
  );
}
