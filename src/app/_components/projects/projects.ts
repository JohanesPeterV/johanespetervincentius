type Project = {
  title: string;
  description: string;
  technologies: string[];
  repoLink: string;
  link?: string;
};

export const projects: Project[] = [
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
    link: 'https://johanespetervincentius.my.id',
    repoLink: 'https://github.com/JohanesPeterV/johanespetervincentius',
  },
  {
    title: 'Old Portfolio',
    description:
      'My previous portfolio site, featuring a particle background, light/dark mode, and smooth transitions.',
    technologies: ['React', 'Gatsby', 'Tailwind'],
    link: 'https://jpv.my.id',
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
