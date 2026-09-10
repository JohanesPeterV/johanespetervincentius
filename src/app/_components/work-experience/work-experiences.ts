import type { Stack } from '@/app/_components/stack';

export type WorkExperience = {
  company: string;
  status: 'current' | 'past';
  stack: Stack;
  positions: {
    name: string;
    workPeriod: string;
    description: string;
  }[];
  showcases: {
    title: string;
    description: string;
  }[];
};

export const WORK_EXPERIENCES: WorkExperience[] = [
  {
    company: 'Smilie',
    status: 'current',
    stack: {
      primary: [
        'Next.js',
        'TypeScript',
        'tRPC',
        'Prisma',
        'PostgreSQL',
        'Convex',
      ],
      others: [
        'Turborepo',
        'Clerk',
        'Stripe',
        'Resend',
        'Upstash Redis',
        'Playwright',
        'Sentry',
        'PostHog',
        'Vercel',
        'OpenAI',
      ],
    },
    positions: [
      {
        name: 'Lead Software Engineer',
        workPeriod: 'Sep 2025 – Present',
        description:
          'Lead technical direction across corporate gifting, digital rewards, and e-commerce, working directly with the Founder on product and operational decisions.',
      },
    ],
    showcases: [
      {
        title: 'Code review and onboarding',
        description:
          'Onboard engineers and set conventions for code review, testing, and delivery.',
      },
      {
        title: 'Architecture and operations',
        description:
          'Own architecture, database design, vendor integrations, and production reliability.',
      },
      {
        title: 'AI-assisted development',
        description:
          'Build AI-assisted development workflows for a lean engineering team.',
      },
    ],
  },
  {
    company: 'TableLink',
    status: 'past',
    stack: {
      primary: ['React', 'Next.js', 'Vite', 'TypeScript'],
      others: [
        'Storybook',
        'Socket.IO',
        'Electron',
        'TanStack Query',
        'Tailwind CSS',
        'Express',
      ],
    },
    positions: [
      {
        name: 'Full-stack Developer',
        workPeriod: 'Feb – Sep 2025',
        description:
          'Delivered QR ordering, dynamic menus, and real-time guest operations while standardizing the shared architecture behind them.',
      },
    ],
    showcases: [
      {
        title: 'Shared frontend architecture',
        description:
          'Standardized Next.js and Vite apps with reusable components and Storybook.',
      },
      {
        title: 'Real-time infrastructure',
        description:
          'Designed shared data infrastructure for synchronized operational tables and live updates.',
      },
      {
        title: 'Code review and releases',
        description:
          'Reduced debt across services and strengthened code review and release practices.',
      },
    ],
  },
  {
    company: 'Farmio',
    status: 'past',
    stack: {
      primary: ['Next.js', 'Express', 'Prisma', 'TypeScript'],
      others: [
        'Nx',
        'MUI',
        'NextAuth',
        'OpenAI',
        'LangChain',
        'WhatsApp Cloud API',
        'BullMQ',
        'Redis',
        'Stripe',
        'PostHog',
        'Sentry',
      ],
    },
    positions: [
      {
        name: 'Software Engineer',
        workPeriod: 'Nov 2023 – Nov 2024',
        description:
          'Shipped WhatsApp-to-order automation with GPT-3.5 and established code and review conventions as the team grew.',
      },
    ],
    showcases: [
      {
        title: 'Agent Portal',
        description:
          'Designed and built the Agent Portal end to end, from authentication to UI.',
      },
      {
        title: 'Price integrity',
        description:
          'Moved checkout pricing to the backend for consistent prices across platforms.',
      },
      {
        title: 'Shared components and localization',
        description:
          'Consolidated duplicated pages and standardized internationalization across three locales.',
      },
    ],
  },
  {
    company: 'BINUS University',
    status: 'past',
    stack: {
      primary: ['ASP.NET', 'C#', 'SQL Server', 'Vue.js'],
      others: ['Next.js', 'Nest.js'],
    },
    positions: [
      {
        name: 'Database Administrator · Developer Intern · Teaching Assistant',
        workPeriod: 'Aug 2020 – Feb 2024',
        description:
          'Built and maintained practicum systems at the Software Lab Center, alongside teaching and database administration.',
      },
    ],
    showcases: [
      {
        title: '5,293 users',
        description:
          'Shipped evaluation and dashboard features for an internal Vue.js and ASP.NET application.',
      },
      {
        title: 'Operational reliability',
        description:
          'Maintained the practicum database, operational procedures, and ASP.NET staff application.',
      },
      {
        title: 'Full-stack tooling',
        description:
          'Developed a Next.js and Nest.js application for internal operations.',
      },
    ],
  },
];
