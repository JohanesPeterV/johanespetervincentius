import type { Stack } from '@/app/_components/stack';

export type Project = {
  title: string;
  description: string;
  stack: Stack;
  repoLink?: string;
  link?: string;
  image?: string;
};

export const POMODORO_PLANTER = {
  title: 'Pomodoro Planter',
  description:
    'Turn focused time into a growing garden. A complete product with custom timer cycles, persistent plants, and a timer that syncs across devices when you sign in.',
  stack: {
    primary: ['Next.js', 'Convex', 'Clerk'],
    others: ['TypeScript', 'shadcn/ui', 'Tailwind CSS', 'PostHog'],
  },
  link: 'https://pomoplanter.com',
  image: '/projects/pomoplanter-morning.webp',
  screenshots: [
    {
      label: 'Morning',
      src: '/projects/pomoplanter-morning.webp',
      alt: 'Pomodoro Planter in morning mode, with a focus timer beside a garden of mature tomato plants.',
    },
    {
      label: 'Night',
      src: '/projects/pomoplanter-night.webp',
      alt: 'Pomodoro Planter in night mode, with glowing lamps around a garden of mature tomato plants.',
    },
  ],
};

export const projects: Project[] = [
  POMODORO_PLANTER,
  {
    title: 'Simple Helpdesk',
    description:
      'A minimalistic helpdesk app featuring a ticketing system with email notifications.',
    stack: {
      primary: ['Next.js', 'Prisma', 'PostgreSQL'],
      others: ['Tailwind CSS'],
    },
    repoLink: 'https://github.com/JohanesPeterV/simple-helpdesk',
  },
  {
    title: 'MyUtang Backend',
    description:
      'A GraphQL server with authentication for managing and tracking debts between users.',
    stack: { primary: ['Apollo Server', 'GraphQL'], others: ['Node.js'] },
    repoLink: 'https://github.com/JohanesPeterV/MyUtangBackend',
  },
  {
    title: 'Portfolio',
    description:
      'My current portfolio website built with modern UI components and theming.',
    stack: {
      primary: ['Next.js', 'Three.js', 'React Three Fiber'],
      others: ['shadcn/ui', 'Tailwind CSS', 'Jotai'],
    },
    repoLink: 'https://github.com/JohanesPeterV/johanespetervincentius',
  },
  {
    title: 'Old Portfolio',
    description:
      'My previous portfolio site, featuring a particle background, light/dark mode, and smooth transitions.',
    stack: { primary: ['React', 'Gatsby'], others: ['Tailwind CSS'] },
    repoLink: 'https://github.com/JopHme/jpv',
  },
  {
    title: 'Chantuy',
    description:
      'A serverless mobile forum app built with Firebase, supporting Google Login, theming, and localization.',
    stack: { primary: ['Android', 'Kotlin', 'Firebase'], others: [] },
    repoLink: 'https://github.com/JopHme/chantuy-app',
  },
  {
    title: 'Phat',
    description:
      'A multifunctional Discord bot with features like YouTube search and Google Drive integration.',
    stack: { primary: ['Node.js', 'Discord.js'], others: [] },
    repoLink: 'https://github.com/JohanesPeterV/phat',
    link: 'https://drive.google.com/file/d/13lv5drh4_SWEt5FGjM1LnO49YcWYOl0w/preview',
  },
];
