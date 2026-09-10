export type Stack = {
  primary: string[];
  secondary: string[];
};

// REASON: primary is the stack Peter reaches for on every build (Smilie,
// Pomodoro Planter); secondary is everything else he has shipped with
export const STACK: Stack = {
  primary: [
    'Next.js',
    'TypeScript',
    'tRPC',
    'Prisma',
    'PostgreSQL',
    'Convex',
    'Tailwind CSS',
    'shadcn/ui',
  ],
  secondary: [
    'Clerk',
    'Stripe',
    'Resend',
    'Upstash Redis',
    'Turborepo',
    'Playwright',
    'Sentry',
    'PostHog',
    'Vercel',
    'Zod',
    'Three.js',
    'React Three Fiber',
    'Express',
    'Vite',
    'Storybook',
    'Socket.IO',
    'OpenAI',
    'Nx',
    'GraphQL',
    'ASP.NET',
    'C#',
    'SQL Server',
    'Vue.js',
    'Nest.js',
    'Kotlin',
    'Firebase',
  ],
};
