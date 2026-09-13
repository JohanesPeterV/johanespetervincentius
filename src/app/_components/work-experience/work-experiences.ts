export type WorkExperience = {
  company: string;
  status: 'current' | 'past';
  summary?: string;
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
    summary:
      'Own engineering across corporate gifting, online ordering, and rewards — connecting payments, inventory, fulfilment, and accounting.',
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
          'Work directly with the Founder to turn business needs into production systems. Own architecture and delivery across Smilie’s storefront, gifting operations, and IG Club Rewards, including the move from legacy WordPress and Airtable workflows.',
      },
    ],
    showcases: [
      {
        title: 'Commerce & gifting',
        description:
          'Connect product selection and checkout with gifting campaigns, recipient allocations, and delivery scheduling, so customer orders flow into the tools used by operations.',
      },
      {
        title: 'Inventory & fulfilment',
        description:
          'Build stock reservations, packing, dispatch, and courier tracking around an inventory ledger that traces each movement between warehouse stock and customer-owned inventory.',
      },
      {
        title: 'Payments & accounting',
        description:
          'Integrate Stripe payments, company credits, and Xero invoicing. Build reconciliation and retry workflows so failed accounting updates can recover without undoing successful payments.',
      },
      {
        title: 'Rewards platform',
        description:
          'Build and operate IG Club Rewards: points wallets, physical gift redemption, and digital vouchers through Qwikcilver, with activation retries, expiry handling, and redemption reporting.',
      },
      {
        title: 'Catalogue automation',
        description:
          'Turn supplier data into usable product listings through shared import tools and AI-assisted categorisation, marketing copy, and SEO, with structured validation and review flags.',
      },
      {
        title: 'Engineering foundations',
        description:
          'Unify storefront and operations apps around shared business logic, database models, and UI. Establish automated checks, database and browser tests, review standards, and engineer onboarding.',
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
