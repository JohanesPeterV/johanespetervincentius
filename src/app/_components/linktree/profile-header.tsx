export default function ProfileHeader() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/60 text-4xl font-bold text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-white/30">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/40 to-transparent opacity-70"
        />
        <span className="relative">J</span>
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Johanes Peter Vincentius
        </h1>
        <p className="text-sm text-muted-foreground">
          Building things for the web
        </p>
      </div>
    </div>
  );
}
