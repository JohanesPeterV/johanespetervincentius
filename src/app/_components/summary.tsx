import Links from '@/components/links';
import { Button } from '@/components/ui/button';

const BUILT_WITH = [
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
          <h3 className="text-2xl font-medium tracking-tight mb-6">Connect</h3>
          <div className="flex justify-center">
            <Links className="gap-6" />
          </div>
        </div>

        <div className="pt-8 border-t border-border">
          <h3 className="text-2xl font-medium tracking-tight mb-6">
            Built With
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {BUILT_WITH.map((tech) => (
              <Button
                key={tech.name}
                asChild
                variant="outline"
                className="h-auto min-h-11 whitespace-normal px-3 text-center"
              >
                <a href={tech.url} target="_blank" rel="noopener noreferrer">
                  {tech.name}
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
