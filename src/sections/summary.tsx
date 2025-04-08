import Links from '../components/links';

export function Summary() {
  return (
    <div className="min-h-screen grid place-items-center p-8">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 transition-colors duration-200 hover:border-primary/50">
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <p className="text-muted-foreground mb-4">
              Feel free to reach out through any of these platforms:
            </p>
            <Links iconSize={24} />
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 transition-colors duration-200 hover:border-primary/50">
            <h3 className="text-lg font-semibold mb-4">Built With</h3>
            <p className="text-muted-foreground mb-4">
              This portfolio is crafted using modern web technologies:
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-primary/10 rounded-full text-sm">
                Next.js
              </span>
              <span className="px-3 py-1.5 bg-primary/10 rounded-full text-sm">
                TypeScript
              </span>
              <span className="px-3 py-1.5 bg-primary/10 rounded-full text-sm">
                Tailwind CSS
              </span>
              <span className="px-3 py-1.5 bg-primary/10 rounded-full text-sm">
                shadcn/ui
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
