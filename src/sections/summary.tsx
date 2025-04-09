import Links from '@/components/links';

const TECHNOLOGIES = [
  {
    name: 'Next.js',
    url: 'https://github.com/vercel/next.js',
  },
  {
    name: 'TypeScript',
    url: 'https://github.com/microsoft/TypeScript',
  },
  {
    name: 'shadcn/ui',
    url: 'https://github.com/shadcn-ui/ui',
  },
  {
    name: 'Three.js',
    url: 'https://github.com/mrdoob/three.js',
  },
  {
    name: 'React Three Fiber',
    url: 'https://github.com/pmndrs/react-three-fiber',
  },
  {
    name: 'React Three Drei',
    url: 'https://github.com/pmndrs/drei',
  },
  {
    name: 'react-fluid-distortion',
    url: 'https://github.com/whatisjery/react-fluid-distortion',
  },
  {
    name: 'react-icons',
    url: 'https://github.com/react-icons/react-icons',
  },
];

export function Summary() {
  return (
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
            {TECHNOLOGIES.map((tech) => (
              <a
                key={tech.name}
                href={tech.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-lg text-sm font-medium text-foreground/80 transition-all hover:scale-105 text-center block"
              >
                {tech.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
