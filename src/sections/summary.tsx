import MacbookShowcase from '@/components/3d/macbook-showcase';
import Links from '@/components/links';

export function Summary() {
  return (
    <MacbookShowcase>
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="space-y-8 w-full max-w-xl">
          <div>
            <h3 className="text-2xl font-medium tracking-tight mb-6 bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
              Connect
            </h3>
            <div className="flex justify-center">
              <Links iconSize={32} className="gap-6" />
            </div>
          </div>

          <div className="pt-8 border-t border-primary/10">
            <h3 className="text-2xl font-medium tracking-tight mb-6 bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
              Built With
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <span className="px-4 py-2 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-lg text-sm font-medium text-foreground/80 transition-all hover:scale-105 text-center">
                Next.js
              </span>
              <span className="px-4 py-2 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-lg text-sm font-medium text-foreground/80 transition-all hover:scale-105 text-center">
                TypeScript
              </span>
              <span className="px-4 py-2 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-lg text-sm font-medium text-foreground/80 transition-all hover:scale-105 text-center">
                Tailwind
              </span>
              <span className="px-4 py-2 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-lg text-sm font-medium text-foreground/80 transition-all hover:scale-105 text-center">
                shadcn/ui
              </span>
              <span className="px-4 py-2 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-lg text-sm font-medium text-foreground/80 transition-all hover:scale-105 text-center">
                Three.js
              </span>
              <span className="px-4 py-2 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-lg text-sm font-medium text-foreground/80 transition-all hover:scale-105 text-center">
                React Three Fiber
              </span>
            </div>
          </div>
        </div>
      </div>
    </MacbookShowcase>
  );
}
