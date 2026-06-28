const INTRO_ROLES = [
  {
    key: 'engineer',
    label: 'Software Engineer',
  },
  {
    key: 'developer',
    label: 'Full Stack Developer',
  },
  {
    key: 'builder',
    label: 'Interactive Web Builder',
  },
  {
    key: 'engineer-repeat',
    label: 'Software Engineer',
  },
];

export default function ProfileHeader() {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="dynamic-avatar relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/60 text-5xl font-black text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-primary/30">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-primary-foreground/40 to-transparent opacity-70"
        />
        <span className="relative">J</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <p className="dynamic-intro-kicker text-xs font-semibold uppercase text-primary">
          Interactive Portfolio
        </p>
        <h1 className="dynamic-intro-title max-w-xs text-balance text-2xl font-black text-foreground sm:text-3xl">
          Johanes Peter Vincentius
        </h1>
        <div className="dynamic-role-window text-sm font-medium text-foreground/80">
          <span className="sr-only">
            Software Engineer, Full Stack Developer, Interactive Web Builder
          </span>
          <span aria-hidden className="dynamic-role-reel">
            {INTRO_ROLES.map((role) => (
              <span key={role.key}>{role.label}</span>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
