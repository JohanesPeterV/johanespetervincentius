export default function ExploreSection() {
  return (
    <section className="flex w-full justify-center px-4">
      <div className="w-full max-w-md text-center font-mono">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {'// Portfolio_01'}
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          Another world
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Scrolling dives the camera through the core and surfaces in a second
          scene. This panel is the landing world.
        </p>
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-foreground/80">
          [ click to explore ]
        </p>
      </div>
    </section>
  );
}
