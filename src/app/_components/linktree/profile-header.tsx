export default function ProfileHeader() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-primary/10 text-4xl text-white ring-1 ring-white/10">
        J
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl text-white">Johanes Peter Vincentius</h1>
        <p className="text-sm text-white/60">Building things for the web</p>
      </div>
    </div>
  );
}
