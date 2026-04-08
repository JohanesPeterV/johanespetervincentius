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
      'A lean helpdesk workflow with ticketing and email notifications, built to keep support operations clear without unnecessary product weight.',
    technologies: ['Next.js', 'Tailwind', 'Prisma', 'PostgreSQL'],
    repoLink: 'https://github.com/JohanesPeterV/simple-helpdesk',
  },
  {
    title: 'MyUtang Backend',
    description:
      'An authenticated GraphQL backend for shared debt tracking, focused on clean domain modeling and predictable API behavior.',
    technologies: ['Apollo Server', 'GraphQL'],
    repoLink: 'https://github.com/JohanesPeterV/MyUtangBackend',
  },
  {
    title: 'Portfolio',
    description:
      'A motion-rich personal site built with Next.js, dynamic theming, and interactive graphics to show that polish and engineering restraint can coexist.',
    technologies: ['Next.js', 'Tailwind', 'Three.js'],
    link: 'https://johanespetervincentius.my.id',
    repoLink: 'https://github.com/JohanesPeterV/johanespetervincentius',
  },
];
