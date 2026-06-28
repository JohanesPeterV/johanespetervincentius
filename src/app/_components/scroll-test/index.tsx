export default function ScrollTestSection() {
  return (
    <section className="flex w-full justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-background/70 p-8 text-center shadow-2xl backdrop-blur-2xl">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Scroll test
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-foreground">
          Random section
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This section only exists to confirm the homepage now scrolls like the
          portfolio route.
        </p>
      </div>
    </section>
  );
}
