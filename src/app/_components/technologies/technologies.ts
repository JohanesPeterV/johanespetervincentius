export type Technology = {
  category: string;
  contents: {
    name: string;
    link: string;
  }[];
};

export const TECHNOLOGIES: Technology[] = [
  {
    category: 'Frontend',
    contents: [
      { name: 'Next.js', link: 'https://nextjs.org/' },
      { name: 'React', link: 'https://react.dev/' },
      { name: 'TypeScript', link: 'https://www.typescriptlang.org/' },
      { name: 'Tailwind CSS', link: 'https://tailwindcss.com/' },
      { name: 'shadcn/ui', link: 'https://ui.shadcn.com/' },
      { name: 'Three.js', link: 'https://threejs.org/' },
    ],
  },
  {
    category: 'Backend',
    contents: [
      { name: 'Convex', link: 'https://www.convex.dev/' },
      { name: 'tRPC', link: 'https://trpc.io/' },
      { name: 'Prisma', link: 'https://www.prisma.io/' },
      { name: 'PostgreSQL', link: 'https://www.postgresql.org/' },
      { name: 'Zod', link: 'https://zod.dev/' },
    ],
  },
  {
    category: 'Platform',
    contents: [
      { name: 'Vercel', link: 'https://vercel.com/' },
      { name: 'Clerk', link: 'https://clerk.com/' },
      { name: 'Stripe', link: 'https://stripe.com/docs' },
      { name: 'Resend', link: 'https://resend.com/' },
      { name: 'Upstash Redis', link: 'https://upstash.com/' },
    ],
  },
  {
    category: 'Tooling',
    contents: [
      { name: 'Turborepo', link: 'https://turbo.build/' },
      { name: 'Playwright', link: 'https://playwright.dev/' },
      { name: 'Sentry', link: 'https://sentry.io/' },
      { name: 'PostHog', link: 'https://posthog.com/' },
    ],
  },
];
