type TechnologyLevel = 'primary' | 'supporting';

type TechnologyItem = {
  name: string;
  link: string;
  level: TechnologyLevel;
};

type CoreStackItem = {
  name: string;
  detail: string;
  link: string;
};

export type Technology = {
  category: string;
  description: string;
  contents: TechnologyItem[];
};

export const CORE_STACK: CoreStackItem[] = [
  {
    name: 'React',
    detail: 'interaction-heavy UI',
    link: 'https://react.dev/',
  },
  {
    name: 'Next.js',
    detail: 'full-stack product delivery',
    link: 'https://nextjs.org/',
  },
  {
    name: 'TypeScript',
    detail: 'typed frontend and APIs',
    link: 'https://www.typescriptlang.org/',
  },
  {
    name: 'Node.js',
    detail: 'services and integrations',
    link: 'https://nodejs.org/en/',
  },
  {
    name: 'PostgreSQL',
    detail: 'default relational store',
    link: 'https://www.postgresql.org/',
  },
  {
    name: 'Vercel',
    detail: 'fast deployment loop',
    link: 'https://vercel.com/',
  },
];

export const TECHNOLOGIES: Technology[] = [
  {
    category: 'Frontend',
    description:
      'Primary stack for production React applications, design systems, interaction-heavy UI, and performance work.',
    contents: [
      { name: 'React', link: 'https://react.dev/', level: 'primary' },
      { name: 'Next.js', link: 'https://nextjs.org/', level: 'primary' },
      {
        name: 'Tailwind CSS',
        link: 'https://tailwindcss.com/',
        level: 'primary',
      },
      { name: 'shadcn/ui', link: 'https://ui.shadcn.com/', level: 'primary' },
      {
        name: 'Three.js',
        link: 'https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene',
        level: 'supporting',
      },
      {
        name: 'React Native',
        link: 'https://reactnative.dev/docs/getting-started',
        level: 'supporting',
      },
      {
        name: 'Flutter',
        link: 'https://flutter.dev/?gclid=Cj0KCQjwtrSLBhCLARIsACh6RmjtHujNS1AIhGk-GQXSfuf8gq-KUuiP0CIjFJEBhg0Q5ZjyIybAew8aAmXMEALw_wcB&gclsrc=aw.ds',
        level: 'supporting',
      },
      { name: 'Angular', link: 'https://angular.io/docs', level: 'supporting' },
      { name: 'Vue.js', link: 'https://vuejs.org/', level: 'supporting' },
      { name: 'Nuxt.js', link: 'https://nuxtjs.org/', level: 'supporting' },
      {
        name: 'Gatsby',
        link: 'https://www.gatsbyjs.com/',
        level: 'supporting',
      },
      {
        name: 'Blazor',
        link: 'https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor',
        level: 'supporting',
      },
      {
        name: 'Semantic UI React',
        link: 'https://react.semantic-ui.com/',
        level: 'supporting',
      },
      {
        name: 'Bootstrap',
        link: 'https://getbootstrap.com/',
        level: 'supporting',
      },
      { name: 'Material UI', link: 'https://mui.com/', level: 'supporting' },
      {
        name: 'Android',
        link: 'https://developer.android.com/',
        level: 'supporting',
      },
    ],
  },
  {
    category: 'Backend',
    description:
      'Default backend layer for typed APIs, integrations, background jobs, and maintainable service boundaries.',
    contents: [
      { name: 'Node.js', link: 'https://nodejs.org/en/', level: 'primary' },
      { name: 'Nest.js', link: 'https://nestjs.com/', level: 'primary' },
      { name: 'Express', link: 'https://expressjs.com/', level: 'primary' },
      {
        name: 'Apollo Server',
        link: 'https://www.apollographql.com/docs/apollo-server/#:~:text=Apollo%20Server%20is%20an%20open,use%20data%20from%20any%20source.',
        level: 'primary',
      },
      { name: 'Laravel', link: 'https://laravel.com/', level: 'supporting' },
      {
        name: 'Ruby on Rails',
        link: 'https://rubyonrails.org/',
        level: 'supporting',
      },
      {
        name: 'ASP.NET',
        link: 'https://dotnet.microsoft.com/en-us/apps/aspnet',
        level: 'supporting',
      },
    ],
  },
  {
    category: 'Languages',
    description:
      'TypeScript is the default. The others come in when platform constraints, integrations, or existing systems require them.',
    contents: [
      {
        name: 'TypeScript',
        link: 'https://www.typescriptlang.org/',
        level: 'primary',
      },
      {
        name: 'JavaScript',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        level: 'primary',
      },
      {
        name: 'C#',
        link: 'https://docs.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/',
        level: 'supporting',
      },
      {
        name: 'Python',
        link: 'https://docs.python.org/3/',
        level: 'supporting',
      },
      {
        name: 'Java',
        link: 'https://docs.oracle.com/en/java/',
        level: 'supporting',
      },
      { name: 'Dart', link: 'https://dart.dev/guides', level: 'supporting' },
      {
        name: 'Kotlin',
        link: 'https://developer.android.com/kotlin?gclid=Cj0KCQjwtrSLBhCLARIsACh6RmhUfKr2tiXSAp33Ka688qBDNF1CIEs53jGAXBkiMzvxFOsQg8of-FQaAv8eEALw_wcB&gclsrc=aw.ds',
        level: 'supporting',
      },
      {
        name: 'PHP',
        link: 'https://www.php.net/docs.php',
        level: 'supporting',
      },
      { name: 'Go', link: 'https://golang.org/doc/', level: 'supporting' },
      {
        name: 'C/C++',
        link: 'https://en.wikipedia.org/wiki/C%2B%2B',
        level: 'supporting',
      },
      { name: 'R', link: 'https://www.r-project.org/', level: 'supporting' },
    ],
  },
  {
    category: 'Databases',
    description:
      'PostgreSQL is the default choice. The rest are tools I can work with when the data model or operational tradeoffs differ.',
    contents: [
      {
        name: 'PostgreSQL',
        link: 'https://www.postgresql.org/',
        level: 'primary',
      },
      { name: 'MongoDB', link: 'https://docs.mongodb.com/', level: 'primary' },
      { name: 'MySQL', link: 'https://dev.mysql.com/doc/', level: 'primary' },
      {
        name: 'SQL Server',
        link: 'https://docs.microsoft.com/en-us/sql/sql-server/?view=sql-server-ver15',
        level: 'supporting',
      },
      {
        name: 'Cloud Firestore',
        link: 'https://firebase.google.com/docs/firestore',
        level: 'supporting',
      },
      {
        name: 'SQLite',
        link: 'https://www.sqlite.org/index.html',
        level: 'supporting',
      },
    ],
  },
  {
    category: 'Infrastructure',
    description:
      'Typical deployment targets for shipping web products without unnecessary operational overhead.',
    contents: [
      {
        name: 'Vercel',
        link: 'https://vercel.com/',
        level: 'primary',
      },
      {
        name: 'AWS',
        link: 'https://aws.amazon.com',
        level: 'primary',
      },
      {
        name: 'Firebase',
        link: 'https://firebase.google.com/',
        level: 'primary',
      },
      {
        name: 'Netlify',
        link: 'https://www.netlify.com/',
        level: 'supporting',
      },
      {
        name: 'Heroku',
        link: 'https://www.heroku.com/',
        level: 'supporting',
      },
    ],
  },
];
