import { cn } from '@/lib/utils';
import { Technology } from './technologies';

export default function TechnologySection(props: {
  title: string;
  contents: Technology['contents'];
}) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg sm:text-xl font-semibold mb-3">{props.title}</h2>
      <div
        className="flex-1"
        role="list"
        aria-label={`${props.title} technologies`}
      >
        <div className="grid grid-cols-2 gap-2">
          {props.contents.map((content, index) => (
            <a
              key={index}
              href={content.link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'block w-full px-2 py-1.5 rounded-lg',
                'bg-secondary/50 hover:bg-primary/10',
                'transition-colors duration-200',
                'border border-transparent hover:border-primary/20',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
              )}
              tabIndex={0}
              role="listitem"
              aria-label={`Visit ${content.name} documentation`}
            >
              <div className="text-xs sm:text-sm text-center text-foreground hover:text-primary transition-colors truncate">
                {content.name}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
