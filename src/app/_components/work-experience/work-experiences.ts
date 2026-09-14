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
      'Own the platforms behind custom merchandise, corporate gifting, and rewards — from quotes and checkout to inventory, delivery, and accounting.',
    products: [
      {
        name: 'Smilie',
        href: 'https://smilie.io',
        description: 'Corporate gifting & commerce',
      },
      {
        name: 'Gift Management',
        href: 'https://gms.smilie.io',
        description: 'Merchandise, gifting & fulfilment',
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
          'Work directly with the Founder to build and operate Smilie’s commerce, merchandise, gifting, and rewards platforms. Own architecture, business workflows, and production delivery, replacing legacy WordPress and Airtable processes.',
      },
    ],
    showcases: [
      {
        title: 'Custom merchandise',
        description:
          'Build the workflow from product proposals and quantity-based pricing to customer approvals, revised quotes, and confirmed orders, with inventory reservations tied to order decisions.',
      },
      {
        title: 'Gifting & fulfilment',
        description:
          'Connect checkout and recipient campaigns to stock reservations, packing, dispatch, and courier tracking. An inventory ledger traces movements between warehouse stock and customer-owned inventory.',
      },
      {
        title: 'Payments & accounting',
        description:
          'Connect Stripe payments, company credits, and Xero invoices, with reconciliation and retries that recover failed accounting updates while preserving successful payments.',
      },
      {
        title: 'Rewards platform',
        description:
          'Build IG Club Rewards for points-based physical gifts and digital vouchers, including wallets, Qwikcilver integration, activation retries, expiry handling, and redemption reports.',
      },
      {
        title: 'Catalogue automation',
        description:
          'Turn supplier data into product listings with reusable import tools and AI-assisted categorisation, copy, and SEO. Validate structured output and flag uncertain results for review.',
      },
      {
        title: 'Engineering foundations',
        description:
          'Unify apps around shared business logic, database models, and UI. Establish database and browser tests, automated checks, code review standards, and engineer onboarding.',
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
