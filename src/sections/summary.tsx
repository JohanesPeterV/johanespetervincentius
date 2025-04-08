import { cn } from '@/lib/utils';
import Links from '../components/links';

export function Summary({ className }: { className?: string }) {
  return (
    <div
      id="summary"
      className={cn('flex flex-col h-full max-h-screen py-8', className)}
    >
      <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto px-4">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40 scrollbar-track-transparent pr-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold">Quick Links</h3>
              <nav className="flex flex-col space-y-3">
                <a
                  href="#technologies"
                  className="hover:text-primary transition-colors text-base sm:text-lg"
                >
                  Technologies
                </a>
                <a
                  href="#projects"
                  className="hover:text-primary transition-colors text-base sm:text-lg"
                >
                  Projects
                </a>
                <a
                  href="#work-experience"
                  className="hover:text-primary transition-colors text-base sm:text-lg"
                >
                  Work Experience
                </a>
              </nav>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold">Connect</h3>
              <div className="flex items-center space-x-4">
                <Links iconSize={24} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold">Built With</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-primary/10 rounded-full text-sm sm:text-base">
                  Next.js
                </span>
                <span className="px-3 py-1.5 bg-primary/10 rounded-full text-sm sm:text-base">
                  TypeScript
                </span>
                <span className="px-3 py-1.5 bg-primary/10 rounded-full text-sm sm:text-base">
                  Tailwind CSS
                </span>
                <span className="px-3 py-1.5 bg-primary/10 rounded-full text-sm sm:text-base">
                  shadcn/ui
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
