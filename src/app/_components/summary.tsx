import Links from '@/components/links';
import SectionShell from './section-shell';

const Summary = (): React.JSX.Element => {
  return (
    <SectionShell
      eyebrow="Open channel"
      title="If the work matters, reach out."
      description="I like product problems with real operational weight: internal tooling, commerce, AI-assisted workflows, and systems that need to survive production reality."
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-primary/20 bg-zinc-900/90 px-4 py-4">
          <p className="font-mono text-sm text-zinc-500">$ availability</p>
          <p className="mt-3 text-sm leading-7 text-zinc-200 sm:text-[15px]">
            Open to product engineering roles and freelance work where I can own
            architecture, delivery, and iteration.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
          <p className="font-mono text-sm text-zinc-500">$ contact</p>
          <div className="mt-4">
            <Links variant="label" className="gap-3" />
          </div>
        </div>
      </div>
    </SectionShell>
  );
};

export { Summary };
