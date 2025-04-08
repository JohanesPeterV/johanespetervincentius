import { cn } from '@/lib/utils';
import Links from '../components/links';
import RandomColorButton from '../components/theme-buttons/random-color-button';
import { Title } from '../components/title';

export function Summary({ className }: { className?: string }) {
  const currentYear = new Date().getFullYear();

  return (
    <div
      id="summary"
      className={cn(
        'w-full min-h-screen backdrop-blur-xl',
        'py-16 px-4 sm:px-6 lg:px-8',
        'flex flex-col justify-center',
        className,
      )}
    >
      <div className="max-w-7xl mx-auto w-full">
        <Title className="mb-12 text-center">
          Summ
          <RandomColorButton />
          ry
        </Title>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Quick Links</h3>
            <nav className="flex flex-col space-y-4">
              <a
                href="#technologies"
                className="hover:text-primary transition-colors text-lg"
              >
                Technologies
              </a>
              <a
                href="#projects"
                className="hover:text-primary transition-colors text-lg"
              >
                Projects
              </a>
              <a
                href="#work-experience"
                className="hover:text-primary transition-colors text-lg"
              >
                Work Experience
              </a>
            </nav>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Connect</h3>
            <div className="flex items-center space-x-6">
              <Links iconSize={30} />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Built With</h3>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-primary/10 rounded-full text-base">
                Next.js
              </span>
              <span className="px-4 py-2 bg-primary/10 rounded-full text-base">
                TypeScript
              </span>
              <span className="px-4 py-2 bg-primary/10 rounded-full text-base">
                Tailwind CSS
              </span>
              <span className="px-4 py-2 bg-primary/10 rounded-full text-base">
                shadcn/ui
              </span>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-base text-muted-foreground">
              © {currentYear} Johanes Peter Vincentius. All rights reserved.
            </p>
            <p className="text-base text-muted-foreground">
              Made with ❤️ in Indonesia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
