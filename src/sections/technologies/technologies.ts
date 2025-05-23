export type Technology = {
  category: string;
  contents: {
    name: string;
    link: string;
  }[];
};

export const TECHNOLOGIES: Technology[] = [
  {
    category: 'Front End',
    contents: [
      { name: 'Next.js', link: 'https://nextjs.org/' },
      { name: 'Angular', link: 'https://angular.io/docs' },
      { name: 'React', link: 'https://reactjs.org/docs/getting-started.html' },
      {
        name: 'React Native',
        link: 'https://reactnative.dev/docs/getting-started',
      },

      {
        name: 'Flutter',
        link: 'https://flutter.dev/?gclid=Cj0KCQjwtrSLBhCLARIsACh6RmjtHujNS1AIhGk-GQXSfuf8gq-KUuiP0CIjFJEBhg0Q5ZjyIybAew8aAmXMEALw_wcB&gclsrc=aw.ds',
      },
      {
        name: 'Laravel',
        link: 'https://laravel.com/docs/8.x/installation#meet-laravel',
      },

      { name: 'Vue.js', link: 'https://vuejs.org/' },
      { name: 'Nuxt.js', link: 'https://nuxtjs.org/' },
      { name: 'Gatsby', link: 'https://www.gatsbyjs.com/' },
      { name: 'shadcn/ui', link: 'https://ui.shadcn.com/' },
      {
        name: 'ASP.NET',
        link: 'https://dotnet.microsoft.com/en-us/apps/aspnet',
      },
      {
        name: 'Blazor',
        link: 'https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor',
      },

      {
        name: 'Three JS',
        link: 'https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene',
      },
      { name: 'Semantic UI React', link: 'https://react.semantic-ui.com/' },
      { name: 'Bootstrap', link: 'https://getbootstrap.com/' },
      { name: 'Tailwind CSS', link: 'https://tailwindcss.com/' },
      { name: 'Material UI', link: 'https://mui.com/' },
      {
        name: 'Android',
        link: 'https://developer.android.com/',
      },
    ],
  },
  {
    category: 'Back End',
    contents: [
      {
        name: 'Apollo Server',
        link: 'https://www.apollographql.com/docs/apollo-server/#:~:text=Apollo%20Server%20is%20an%20open,use%20data%20from%20any%20source.',
      },
      { name: 'Node.js', link: 'https://nodejs.org/en/' },
      { name: 'Nest.js', link: 'https://nestjs.com/' },
      { name: 'Express', link: 'https://expressjs.com/' },
      { name: 'Ruby on Rails', link: 'https://rubyonrails.org/' },
      { name: 'Laravel', link: 'https://laravel.com/' },
      {
        name: 'ASP.NET',
        link: 'https://dotnet.microsoft.com/en-us/apps/aspnet',
      },
    ],
  },
  {
    category: 'Programming',
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
    category: 'Database',
    contents: [
      {
        name: 'SQL Server',
        link: 'https://docs.microsoft.com/en-us/sql/sql-server/?view=sql-server-ver15',
      },
      { name: 'PostgreSQL', link: 'https://www.postgresql.org/' },
      { name: 'MongoDB', link: 'https://docs.mongodb.com/' },
      {
        name: 'Cloud Firestore',
        link: 'https://firebase.google.com/docs/firestore',
      },
      { name: 'MySQL', link: 'https://dev.mysql.com/doc/' },
      { name: 'SQLite', link: 'https://www.sqlite.org/index.html' },
    ],
  },

  {
    category: 'Cloud',
    contents: [
      {
        name: 'AWS',
        link: 'https://aws.amazon.com',
      },
      {
        name: 'Vercel',
        link: 'https://vercel.com/',
      },
      {
        name: 'Heroku',
        link: 'https://www.heroku.com/',
      },
      { name: 'Netlify', link: 'https://www.netlify.com/' },
      { name: 'Firebase', link: 'https://firebase.google.com/' },
    ],
  },
];
