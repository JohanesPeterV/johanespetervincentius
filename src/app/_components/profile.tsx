import Links from '@/components/links';
import RandomColorButton from '@/components/theme-buttons/random-color-button';

type ProofPoint = {
  label: string;
  value: string;
};

const PROOF_POINTS: ProofPoint[] = [
  {
    label: 'Shipped fast',
    value: 'B2B platform in under 2 months',
  },
  {
    label: 'Saved cost',
    value: '~IDR 72M annually',
  },
  {
    label: 'Supported scale',
    value: '20,000+ students per semester',
  },
];

const Profile = (): React.JSX.Element => {
  return (
    <div className="flex flex-col justify-center min-h-screen px-4 sm:px-6">
      <div
        className={`
          text-transparent bg-gradient-to-r 
          from-foreground via-primary to-muted-foreground
          animate-gradient bg-clip-text
          flex flex-col gap-2 sm:gap-3
          text-center sm:text-left
        `}
      >
        <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight break-words">
          J
          <RandomColorButton className="text-2xl xs:text-3xl sm:text-4xl lg:text-6xl font-extrabold" />
          hanes Peter Vincentius
        </h1>
        <h2 className="text-base xs:text-lg sm:text-xl lg:text-2xl tracking-tight">
          Lead Software Engineer
        </h2>
      </div>
      <p className="mt-6 max-w-3xl text-center text-sm text-foreground/80 sm:text-left sm:text-base lg:text-lg">
        Turning messy business operations into reliable products with clean
        architecture, pragmatic systems thinking, and fast execution.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
        {PROOF_POINTS.map((proofPoint) => (
          <div
            key={proofPoint.label}
            className="rounded-full border border-primary/20 bg-background/40 px-4 py-2 text-xs backdrop-blur-xl sm:text-sm"
          >
            <span className="font-semibold text-foreground">
              {proofPoint.label}:
            </span>{' '}
            <span className="text-muted-foreground">{proofPoint.value}</span>
          </div>
        ))}
      </div>
      <div className="w-full flex justify-center sm:justify-start mt-6 sm:mt-8">
        <Links iconSize={32} />
      </div>
    </div>
  );
};

export default Profile;
