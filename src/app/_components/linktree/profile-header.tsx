export default function ProfileHeader() {
  return (
    <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background/60 font-display text-3xl text-foreground shadow-lg ring-1 ring-foreground/5 sm:h-16 sm:w-16">
        J
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl leading-tight tracking-[-0.035em] text-foreground">
          Johanes Peter Vincentius
        </h1>
        <p className="text-xs leading-relaxed tracking-wide text-muted-foreground">
          Building things for the web
        </p>
      </div>
    </div>
  );
}
