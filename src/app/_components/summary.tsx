import Links from '@/components/links';

type Strength = {
  description: string;
  title: string;
};

const STRENGTHS: Strength[] = [
  {
    title: 'End-to-end ownership',
    description:
      'Comfortable owning architecture, schema design, vendor integrations, deployment, and production stability without needing hand-offs.',
  },
  {
    title: 'Speed with judgment',
    description:
      'I like moving fast, but not recklessly. The goal is fewer rewrites, less debt, and systems that survive real usage.',
  },
  {
    title: 'AI-native delivery',
    description:
      'I actively design AI-assisted engineering workflows that increase output for lean teams while keeping code quality and maintainability high.',
  },
  {
    title: 'Product and team sense',
    description:
      'I work well with founders, operators, and engineers. Clear communication and good technical direction are part of the job.',
  },
];

const Summary = (): React.JSX.Element => {
  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="space-y-8 w-full max-w-4xl">
        <div>
          <h3 className="text-2xl font-medium tracking-tight mb-4 bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent sm:text-3xl">
            Why teams hire me
          </h3>
          <p className="text-center text-sm text-muted-foreground sm:text-left sm:text-base">
            I am at my best in startups that need someone to set direction, ship
            quickly, and keep the system coherent as complexity grows.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {STRENGTHS.map((strength) => (
            <div
              key={strength.title}
              className="rounded-2xl border border-primary/10 bg-primary/5 p-5 text-left backdrop-blur-xl"
            >
              <h4 className="text-base font-semibold text-foreground sm:text-lg">
                {strength.title}
              </h4>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                {strength.description}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-primary/10">
          <h3 className="text-2xl font-medium tracking-tight mb-6 bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
            Connect
          </h3>
          <div className="flex justify-center sm:justify-start">
            <Links iconSize={32} className="gap-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export { Summary };
