import WorkExperience from '.';

type WorkExperience = {
  company: string;
  positions: {
    name: string;
    workPeriod: string;
    description: string;
  }[];
};

export const WORK_EXPERIENCES: WorkExperience[] = [
  {
    company: 'Smilie',
    positions: [
      {
        name: 'Senior Software Engineer',
        workPeriod: '2025-Present',
        description: `Senior Full-Stack Engineer. Pragmatic builder of scalable systems on modern JS and cloud stacks (Vercel, Neon, Upstash, AWS), focused on clean architecture and long-term reliability.`,
      },
    ],
  },
  {
    company: 'Tablelink',
    positions: [
      {
        name: 'Senior Fullstack Developer',
        workPeriod: '2025-2025',
        description: `Built QR-based ordering system for real-time DJ/song requests. Developed live-updating CRUD tables with socket-based concurrency resolution and led migration from GitLab Pro, saving the company ~IDR 72M annually.`,
      },
    ],
  },
  {
    company: 'Farmio',
    positions: [
      {
        name: 'Software Engineer',
        workPeriod: '2023-2024',
        description: `Responsible for database design, software maintenance and full stack software development.`,
      },
    ],
  },
  {
    company: 'Software Lab Center, Binus',
    positions: [
      {
        name: 'Database Administrator',
        workPeriod: '2021-2024',
        description: `Maintained practicum database serving ~20,000 students/semester and ASP.NET web app used by 161 staff.`,
      },
      {
        name: 'Teaching Assistant',
        workPeriod: '2020-2021',
        description: `Delivered programming-based classes for 1,700+ students and created internal applications for practicum needs.`,
      },
    ],
  },
];
