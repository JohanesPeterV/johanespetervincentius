export default function ProfileHeader() {
  return (
    <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
      <p className="mb-2 text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
        Software engineer
      </p>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-light leading-tight tracking-[-0.04em] text-foreground sm:text-4xl">
          Johanes Peter Vincentius
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Building things for the web
        </p>
      </div>
    </div>
  );
}
