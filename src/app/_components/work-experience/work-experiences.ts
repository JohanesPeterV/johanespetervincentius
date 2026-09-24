export type WorkExperience = {
  company: string;
  status: 'current' | 'past';
  summary?: string;
  deliverables?: {
    name: string;
    href: string;
    description: string;
    screenshot: { src: string; alt: string };
  }[];
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
      'Own engineering for custom merchandise, corporate gifting, and rewards systems — from quotes and checkout to inventory, delivery, and accounting.',
    deliverables: [
      {
        name: 'Smilie',
        href: 'https://smilie.io',
        description: 'Corporate gifting & commerce',
        screenshot: {
          src: '/work/smilie-quote.webp',
          alt: 'Smilie product page with quantity-tier pricing and a live quote total',
        },
      },
      {
        name: 'Gift Management',
        href: 'https://gms.smilie.io',
        description: 'Merchandise, gifting & fulfilment',
        screenshot: {
          src: '/work/smilie-gms-recipients.webp',
          alt: 'Gift Management checkout step allocating gift boxes to recipients',
        },
      },
    ],
    positions: [
      {
        name: 'Senior Software Engineer',
        workPeriod: 'Sep 2025 – Present',
        description:
          'Work directly with the Founder on commerce, gifting, and rewards systems. Own architecture, business workflows, and production delivery, replacing legacy WordPress and Airtable processes.',
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
        title: 'Rewards systems',
        description:
          'Develop and maintain rewards systems with points wallets, physical gift redemption, and digital vouchers. Handle provider integrations, activation retries, expiry rules, and redemption reporting.',
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
    deliverables: [
      {
        name: 'Customer Requests',
        href: 'https://dashboard.table.link',
        description: 'Live screen takeover & song queues',
        screenshot: {
          src: '/work/tablelink-screen-takeover.webp',
          alt: 'TableLink screen takeover queue with guest messages, tips, and staff actions',
        },
      },
      {
        name: 'Request settings',
        href: 'https://dashboard.table.link',
        description: 'Schedules, pricing & tip rules',
        screenshot: {
          src: '/work/tablelink-request-settings.webp',
          alt: 'TableLink screen takeover settings with a weekly schedule',
        },
      },
    ],
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
    deliverables: [
      {
        name: 'Farmio',
        href: 'https://farmio.io/en/merchant/',
        description: 'B2B food supply ordering',
        screenshot: {
          src: '/work/farmio-merchant-portal.webp',
          alt: 'Farmio merchant portal with order history and an invoice',
        },
      },
    ],
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
