export type StackGroup = {
  core: string[];
  satellites: string[];
};

export type Stack = {
  groups: StackGroup[];
  drifters: string[];
};

// REASON: core is the stack Peter reaches for on every build (Smilie,
// Pomodoro Planter); satellites are the tools that ship alongside each core;
// drifters are past-platform tools that belong to none of them
export const STACK: Stack = {
  groups: [
    {
      core: ['Next.js'],
      satellites: ['Vercel', 'Clerk', 'Turborepo', 'Nx', 'Sentry', 'PostHog'],
    },
    {
      core: ['TypeScript', 'tRPC'],
      satellites: [
        'Zod',
        'Express',
        'Nest.js',
        'Socket.IO',
        'GraphQL',
        'Vite',
        'Storybook',
        'Playwright',
      ],
    },
    {
      core: ['Prisma', 'PostgreSQL'],
      satellites: ['SQL Server', 'Upstash Redis', 'Firebase'],
    },
    {
      core: ['Convex'],
      satellites: ['OpenAI', 'Resend', 'Stripe'],
    },
    {
      core: ['Tailwind CSS', 'shadcn/ui'],
      satellites: ['Three.js', 'React Three Fiber', 'Vue.js'],
    },
  ],
  drifters: ['ASP.NET', 'C#', 'Kotlin'],
};
