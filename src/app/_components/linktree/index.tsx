import ContactIcons from './contact-icons';
import LinkButtons from './link-buttons';
import ProfileHeader from './profile-header';

export default function LinktreeSection() {
  return (
    <section className="flex w-full justify-center px-4">
      <div className="animate-card-in relative z-10 w-full max-w-md">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-2 rounded-[2.25rem] bg-primary/10 opacity-50 blur-2xl"
        />
        <div className="relative flex flex-col items-center gap-8 overflow-hidden rounded-3xl border border-white/15 bg-black/60 p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 via-white/0 to-transparent"
          />
          <div className="relative z-10 flex w-full flex-col items-center gap-8">
            <ProfileHeader />
            <LinkButtons />
            <ContactIcons />
          </div>
        </div>
      </div>
    </section>
  );
}
