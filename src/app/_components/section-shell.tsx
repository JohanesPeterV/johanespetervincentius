import { cn } from '@/lib/utils';

type SectionShellProps = {
  eyebrow: string;
  title: React.ReactNode;
  description: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  panelClassName?: string;
};

const SectionShell = ({
  eyebrow,
  title,
  description,
  children,
  className,
  panelClassName,
}: SectionShellProps): React.JSX.Element => {
  return (
    <section
      className={cn(
        'flex min-h-screen items-center px-4 py-10 sm:px-6 lg:px-8',
        className,
      )}
    >
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-12">
        <div className="space-y-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-primary/80">
            {eyebrow}
          </p>
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl lg:text-[2.8rem]">
              {title}
            </h2>
            <p className="max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
        </div>

        <div
          className={cn(
            'rounded-[28px] border border-white/10 bg-zinc-950/85 p-4 text-zinc-100 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl sm:p-6',
            panelClassName,
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
};

export default SectionShell;
