export type WorkExperience = {
  company: string;
  status: 'current' | 'past';
  products?: { name: string; href: string; description: string }[];
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
    products: [
      {
        name: 'Smilie',
        href: 'https://smilie.io',
        description: 'Corporate gifting & commerce',
      },
      {
        name: 'Gift Management',
        href: 'https://gms.smilie.io',
        description: 'Orders, inventory & fulfilment',
      },
      {
        name: 'IG Club Rewards',
        href: 'https://ig.smilie.io',
        description: 'Points & reward redemption',
      },
    ],
    positions: [
      {
        name: 'Senior Software Engineer',
        workPeriod: 'Sep 2025 – Present',
        description:
          'Build and operate the systems behind corporate gifting, e-commerce, and digital rewards, working directly with the Founder from product decisions to production delivery.',
      },
    ],
    showcases: [
      {
        title: 'Gifting operations',
        description:
          'Replaced legacy WordPress and Airtable workflows with a unified Next.js and Prisma platform for gifting operations.',
      },
      {
        title: 'Commerce & automation',
        description:
          'Delivered cart, checkout, Stripe payments, order tracking, and email confirmations, alongside AI-assisted product catalogue preparation.',
      },
      {
        title: 'Engineering ownership',
        description:
          'Own architecture, vendor integrations, and production reliability. Onboard engineers and establish code review, testing, and delivery conventions.',
      },
    ],
  },
  {
    company: 'TableLink',
    status: 'past',
    positions: [
      {
        name: 'Senior Software Engineer',
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
