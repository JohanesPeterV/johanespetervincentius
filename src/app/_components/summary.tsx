import Links from '@/components/links';

const Summary = (): React.JSX.Element => {
  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="w-full max-w-xl">
        <div className="space-y-4 text-center sm:text-left">
          <h3 className="text-2xl font-medium tracking-tight bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent sm:text-3xl">
            Elsewhere
          </h3>
          <p className="text-sm text-muted-foreground sm:text-base">
            You can find me here.
          </p>
          <div className="flex justify-center sm:justify-start">
            <Links iconSize={32} className="gap-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export { Summary };
