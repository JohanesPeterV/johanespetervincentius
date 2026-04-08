import Links from '@/components/links';
import RandomColorButton from '@/components/theme-buttons/random-color-button';

const capabilityTags = [
  'internal tools',
  'commerce systems',
  'AI workflows',
  'typed APIs',
];

const heroSignals = [
  {
    label: 'now',
    value: 'Lead Software Engineer at Smilie',
  },
  {
    label: 'stack',
    value: 'Next.js / TypeScript / Node.js / PostgreSQL',
  },
  {
    label: 'mode',
    value: 'Fast execution with strong technical judgment',
  },
];

const Profile = (): React.JSX.Element => {
  return (
    <section className="flex min-h-screen items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-primary/80">
              portfolio://johanes-peter-vincentius
            </p>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl lg:text-7xl">
                Johanes Peter Vincentius
              </h1>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground sm:text-sm">
                Lead software engineer
              </p>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base lg:text-lg">
                Turning messy business operations into reliable products with
                strong technical judgment, fast execution, and AI-native
                workflows.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {capabilityTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/70 bg-background/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/80 backdrop-blur"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              accent shift
            </span>
            <RandomColorButton
              aria-label="Switch accent color"
              className="text-lg font-semibold sm:text-lg lg:text-lg"
            />
          </div>

          <Links variant="label" className="gap-3" />
        </div>

        <div className="rounded-[32px] border border-white/10 bg-zinc-950/85 p-4 text-zinc-100 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl sm:p-6">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 font-mono text-[11px] uppercase tracking-[0.26em] text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            </div>
            <span className="text-primary/90">session_active</span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-primary/25 bg-zinc-900/90 px-4 py-4">
              <p className="font-mono text-sm text-zinc-500">$ focus</p>
              <p className="mt-3 text-sm leading-7 text-zinc-200 sm:text-[15px]">
                I build internal tooling, commerce flows, and operational
                systems that teams can actually depend on.
              </p>
            </div>

            <div className="space-y-3">
              {heroSignals.map((signal) => (
                <div
                  key={signal.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                    {signal.label}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-zinc-200 sm:text-[15px]">
                    {signal.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="font-mono text-sm text-zinc-500">$ next</p>
              <p className="mt-3 text-sm leading-7 text-zinc-300 sm:text-[15px]">
                Open to product engineering work where ownership spans
                architecture, delivery, and iteration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
