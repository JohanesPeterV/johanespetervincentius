export type Technology = {
  category: string;
  contents: {
    name: string;
    link: string;
  }[];
};

export const TECHNOLOGIES: Technology[] = [
  {
    category: 'Programming',
    contents: [
      {
        name: 'C/C++',
        link: 'https://en.wikipedia.org/wiki/C%2B%2B',
      },
      {
        name: 'C#',
        link: 'https://docs.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/',
      },
      { name: 'R', link: 'https://www.r-project.org/' },
      { name: 'Java', link: 'https://docs.oracle.com/en/java/' },
      {
        name: 'JavaScript',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      },
      { name: 'TypeScript', link: 'https://www.typescriptlang.org/' },
      { name: 'Dart', link: 'https://dart.dev/guides' },
      {
        name: 'Kotlin',
        link: 'https://developer.android.com/kotlin?gclid=Cj0KCQjwtrSLBhCLARIsACh6RmhUfKr2tiXSAp33Ka688qBDNF1CIEs53jGAXBkiMzvxFOsQg8of-FQaAv8eEALw_wcB&gclsrc=aw.ds',
      },
      { name: 'Python', link: 'https://docs.python.org/3/' },
      { name: 'PHP', link: 'https://www.php.net/docs.php' },
      { name: 'Go', link: 'https://golang.org/doc/' },
    ],
  },
  {
    category: 'Database',
    contents: [
      {
        name: 'SQL Server',
        link: 'https://docs.microsoft.com/en-us/sql/sql-server/?view=sql-server-ver15',
      },
      { name: 'MongoDB', link: 'https://docs.mongodb.com/' },
      {
        name: 'Cloud Firestore',
        link: 'https://firebase.google.com/docs/firestore',
      },
      { name: 'MySQL', link: 'https://dev.mysql.com/doc/' },
      { name: 'SQLite', link: 'https://www.sqlite.org/index.html' },
      { name: 'PostgreSQL', link: 'https://www.postgresql.org/' },
    ],
  },

  {
    category: 'Front End',
    contents: [
      { name: 'HTML, CSS, JS', link: '' },
      { name: 'Angular', link: 'https://angular.io/docs' },
      { name: 'React', link: 'https://reactjs.org/docs/getting-started.html' },
      {
        name: 'Laravel',
        link: 'https://laravel.com/docs/8.x/installation#meet-laravel',
      },
      { name: 'Semantic UI React', link: 'https://react.semantic-ui.com/' },
      {
        name: 'ASP.NET',
        link: 'https://dotnet.microsoft.com/en-us/apps/aspnet',
      },
      {
        name: 'Blazor',
        link: 'https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor',
      },
      { name: 'Next.js', link: 'https://nextjs.org/' },
      { name: 'Vue.js', link: 'https://vuejs.org/' },
      { name: 'Nuxt.js', link: 'https://nuxtjs.org/' },
      { name: 'Bootstrap', link: 'https://getbootstrap.com/' },
      { name: 'Tailwind CSS', link: 'https://tailwindcss.com/' },
      {
        name: 'Android',
        link: 'https://developer.android.com/',
      },
      {
        name: 'Flutter',
        link: 'https://flutter.dev/?gclid=Cj0KCQjwtrSLBhCLARIsACh6RmjtHujNS1AIhGk-GQXSfuf8gq-KUuiP0CIjFJEBhg0Q5ZjyIybAew8aAmXMEALw_wcB&gclsrc=aw.ds',
      },
      {
        name: 'Three JS',
        link: 'https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene',
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
      { name: 'Laravel', link: 'https://laravel.com/' },
      {
        name: 'ASP.NET',
        link: 'https://dotnet.microsoft.com/en-us/apps/aspnet',
      },
    ],
  },
  {
    category: 'Cloud',
    contents: [
      {
        name: 'Heroku',
        link: 'https://www.heroku.com/',
      },
      { name: 'Netlify', link: 'https://www.netlify.com/' },
      { name: 'Firebase', link: 'https://firebase.google.com/' },
    ],
  },
];
