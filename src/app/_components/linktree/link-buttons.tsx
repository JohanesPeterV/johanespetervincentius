import { LINKTREE_LINKS } from './links';

export default function LinkButtons() {
  return (
    <div className="flex w-full flex-col gap-3">
      {LINKTREE_LINKS.map(({ icon: Icon, label, handle, url }) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 hover:shadow-xl"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
          <Icon className="absolute left-5 shrink-0 text-2xl text-white/70 transition-colors group-hover:text-white" />
          <span className="flex flex-col items-center">
            <span className="text-sm font-semibold text-white">{label}</span>
            <span className="text-xs text-white/60">{handle}</span>
          </span>
        </a>
      ))}
    </div>
  );
}
