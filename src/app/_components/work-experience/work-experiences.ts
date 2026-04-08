type WorkExperience = {
  company: string;
  positions: {
    highlights?: string[];
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
          "Leading the systems behind Smilie's public storefront and internal gifting workflows, from architecture and data design to deployment, integrations, and production stability.",
        highlights: [
          'Replaced a legacy WordPress and Airtable setup with a unified Next.js and Prisma CRM, cutting campaign setup time from hours to minutes.',
          'Shipped the end-to-end ordering flow across cart, checkout, Stripe payments, order tracking, and email confirmations.',
          'Built AI-assisted catalog tooling that scrapes product data and drafts SEO metadata, reducing manual preparation by ~95%.',
        ],
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
          'Built real-time ordering and internal operations tooling for a product team moving quickly.',
        highlights: [
          'Created a QR-based ordering flow where a barcode scan opens a live request menu.',
          'Built live CRUD tables with global sockets and concurrency handling, cutting feature integration time by ~99%.',
          'Introduced code review and led a GitLab migration that saved ~IDR 72M annually across 12 developers.',
        ],
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
          "Worked across Farmio's supplier and merchant platform, building portal, checkout, and internal operations features for an early-stage supply chain product.",
        highlights: [
          'Built the Agent Portal with secure authentication using Next.js and Express.js.',
          'Moved pricing logic server-side to guarantee 100% price integrity across platforms.',
          'Standardized i18n across 3 languages and integrated ChatGPT with WhatsApp, increasing order-processing efficiency by ~80%.',
        ],
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
