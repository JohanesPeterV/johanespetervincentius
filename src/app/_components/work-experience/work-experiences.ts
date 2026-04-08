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
        name: 'Lead Software Engineer',
        workPeriod: '2025-Present',
        description:
          "Own technical direction across Smilie's gifting, rewards, and e-commerce platforms, spanning architecture, database design, vendor integrations, deployment, and production stability. Partner directly with the CEO, build AI-assisted engineering workflows, and keep a lean team shipping through operational complexity.",
      },
    ],
  },
  {
    company: 'Tablelink',
    positions: [
      {
        name: 'Senior Fullstack Developer',
        workPeriod: '2025-2025',
        description:
          'Built a QR-based ordering system for real-time requests, plus live CRUD tables backed by global sockets and concurrency handling. Introduced code review and shared UI standards, and led a GitLab migration that saved ~IDR 72M annually across 12 developers.',
      },
    ],
  },
  {
    company: 'Farmio',
    positions: [
      {
        name: 'Software Engineer',
        workPeriod: '2023-2024',
        description:
          'Built portal, checkout, and internal platform features across Next.js and Express.js, moving pricing logic server-side for 100% price integrity. Reduced ramp-up time with cleaner Redux and TypeScript structure, removed duplicate pages, standardized i18n across 3 languages, and integrated ChatGPT with WhatsApp to increase order-processing efficiency by ~80%.',
      },
    ],
  },
  {
    company: 'Software Lab Center, Binus',
    positions: [
      {
        name: 'Database Administrator',
        workPeriod: '2021-2024',
        description:
          'Maintained practicum databases serving ~20,000 students per semester and an ASP.NET web app used by 161 staff, balancing operational stability with internal tooling improvements.',
      },
      {
        name: 'Full Stack Developer Intern',
        workPeriod: '2022-2023',
        description:
          'Built features for a Vue.js and ASP.NET web app used by 5,293 users, designed the Monthly Evaluation module for 179 projects, and created dashboards with 8+ visual components.',
      },
      {
        name: 'Teaching Assistant',
        workPeriod: '2020-2021',
        description:
          'Delivered 40+ programming classes across 18 subjects for ~1,770 students and built internal tools for practicum operations, earning Best Research in Group twice.',
      },
    ],
  },
];
