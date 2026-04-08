type TechnologyItem = {
  name: string;
  link: string;
};

export type Technology = {
  category: string;
  description: string;
  contents: TechnologyItem[];
};

export const TECHNOLOGIES: Technology[] = [
  {
    category: 'Interface',
    description:
      'Most of my recent frontend work has centered here, especially in React and Next.js environments.',
    contents: [
      { name: 'React', link: 'https://reactjs.org/docs/getting-started.html' },
      { name: 'Next.js', link: 'https://nextjs.org/' },
      { name: 'Tailwind CSS', link: 'https://tailwindcss.com/' },
      { name: 'shadcn/ui', link: 'https://ui.shadcn.com/' },
      {
        name: 'Three.js',
        link: 'https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene',
      },
      {
        name: 'React Native',
        link: 'https://reactnative.dev/docs/getting-started',
      },
      {
        name: 'Flutter',
        link: 'https://flutter.dev/?gclid=Cj0KCQjwtrSLBhCLARIsACh6RmjtHujNS1AIhGk-GQXSfuf8gq-KUuiP0CIjFJEBhg0Q5ZjyIybAew8aAmXMEALw_wcB&gclsrc=aw.ds',
      },
      { name: 'Angular', link: 'https://angular.io/docs' },
      { name: 'Vue.js', link: 'https://vuejs.org/' },
      { name: 'Nuxt.js', link: 'https://nuxtjs.org/' },
      { name: 'Gatsby', link: 'https://www.gatsbyjs.com/' },
      {
        name: 'Blazor',
        link: 'https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor',
      },
      { name: 'Semantic UI React', link: 'https://react.semantic-ui.com/' },
      { name: 'Bootstrap', link: 'https://getbootstrap.com/' },
      { name: 'Material UI', link: 'https://mui.com/' },
      {
        name: 'Android',
        link: 'https://developer.android.com/',
      },
    ],
  },
  {
    category: 'Backend',
    description:
      'The backend tools I know best for API design, integrations, and TypeScript-heavy product work.',
    contents: [
      { name: 'Node.js', link: 'https://nodejs.org/en/' },
      { name: 'Nest.js', link: 'https://nestjs.com/' },
      { name: 'Express', link: 'https://expressjs.com/' },
      {
        name: 'Apollo Server',
        link: 'https://www.apollographql.com/docs/apollo-server/#:~:text=Apollo%20Server%20is%20an%20open,use%20data%20from%20any%20source.',
      },
      { name: 'Laravel', link: 'https://laravel.com/' },
      { name: 'Ruby on Rails', link: 'https://rubyonrails.org/' },
      {
        name: 'ASP.NET',
        link: 'https://dotnet.microsoft.com/en-us/apps/aspnet',
      },
    ],
  },
  {
    category: 'Languages',
    description:
      'TypeScript is the center of gravity, with the others coming in where the domain or platform needs them.',
    contents: [
      { name: 'TypeScript', link: 'https://www.typescriptlang.org/' },
      {
        name: 'JavaScript',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      },
      {
        name: 'C#',
        link: 'https://docs.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/',
      },
      { name: 'Python', link: 'https://docs.python.org/3/' },
      { name: 'Java', link: 'https://docs.oracle.com/en/java/' },
      { name: 'Dart', link: 'https://dart.dev/guides' },
      {
        name: 'Kotlin',
        link: 'https://developer.android.com/kotlin?gclid=Cj0KCQjwtrSLBhCLARIsACh6RmhUfKr2tiXSAp33Ka688qBDNF1CIEs53jGAXBkiMzvxFOsQg8of-FQaAv8eEALw_wcB&gclsrc=aw.ds',
      },
      { name: 'PHP', link: 'https://www.php.net/docs.php' },
      { name: 'Go', link: 'https://golang.org/doc/' },
      {
        name: 'C/C++',
        link: 'https://en.wikipedia.org/wiki/C%2B%2B',
      },
      { name: 'R', link: 'https://www.r-project.org/' },
    ],
  },
  {
    category: 'Data',
    description:
      'Usually PostgreSQL first, then other options depending on the product shape and operational needs.',
    contents: [
      { name: 'PostgreSQL', link: 'https://www.postgresql.org/' },
      { name: 'MongoDB', link: 'https://docs.mongodb.com/' },
      { name: 'MySQL', link: 'https://dev.mysql.com/doc/' },
      {
        name: 'SQL Server',
        link: 'https://docs.microsoft.com/en-us/sql/sql-server/?view=sql-server-ver15',
      },
      {
        name: 'Cloud Firestore',
        link: 'https://firebase.google.com/docs/firestore',
      },
      { name: 'SQLite', link: 'https://www.sqlite.org/index.html' },
    ],
  },
  {
    category: 'Shipping',
    description:
      'Where I usually land when a project needs to ship cleanly and stay easy to operate.',
    contents: [
      {
        name: 'Vercel',
        link: 'https://vercel.com/',
      },
      {
        name: 'AWS',
        link: 'https://aws.amazon.com',
      },
      { name: 'Firebase', link: 'https://firebase.google.com/' },
      { name: 'Netlify', link: 'https://www.netlify.com/' },
      {
        name: 'Heroku',
        link: 'https://www.heroku.com/',
      },
    ],
  },
];
