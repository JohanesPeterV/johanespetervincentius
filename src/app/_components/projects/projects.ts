type Project = {
  title: string;
  description: string;
  technologies: string[];
  repoLink?: string;
  link?: string;
  image?: string;
};

export const POMODORO_PLANTER = {
  title: 'Pomodoro Planter',
  description:
    'Turn focused time into a growing garden. A complete product with custom timer cycles, persistent plants, and a timer that syncs across devices when you sign in.',
  technologies: ['Next.js', 'TypeScript', 'Convex', 'Clerk'],
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
    technologies: ['Next.js', 'Tailwind', 'Prisma', 'PostgreSQL'],
    repoLink: 'https://github.com/JohanesPeterV/simple-helpdesk',
  },
  {
    title: 'MyUtang Backend',
    description:
      'A GraphQL server with authentication for managing and tracking debts between users.',
    technologies: ['Apollo Server', 'GraphQL'],
    repoLink: 'https://github.com/JohanesPeterV/MyUtangBackend',
  },
  {
    title: 'Portofolio',
    description:
      'My current portfolio website built with modern UI components and theming.',
    technologies: ['Next.js', 'shadcn/ui'],
    repoLink: 'https://github.com/JohanesPeterV/johanespetervincentius',
  },
  {
    title: 'Old Portfolio',
    description:
      'My previous portfolio site, featuring a particle background, light/dark mode, and smooth transitions.',
    technologies: ['React', 'Gatsby', 'Tailwind'],
    repoLink: 'https://github.com/JopHme/jpv',
  },
  {
    title: 'Chantuy',
    description:
      'A serverless mobile forum app built with Firebase, supporting Google Login, theming, and localization.',
    technologies: ['Android', 'Kotlin', 'Firebase'],
    repoLink: 'https://github.com/JopHme/chantuy-app',
  },
  {
    title: 'Phat',
    description:
      'A multifunctional Discord bot with features like YouTube search and Google Drive integration.',
    technologies: ['Node.js', 'Discord.js'],
    repoLink: 'https://github.com/JohanesPeterV/phat',
    link: 'https://drive.google.com/file/d/13lv5drh4_SWEt5FGjM1LnO49YcWYOl0w/preview',
  },
];
