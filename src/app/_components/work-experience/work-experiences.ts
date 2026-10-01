export type WorkExperience = {
  company: string;
  status: 'current' | 'past';
  metrics: { value: string; label: string }[];
  metricsPeriod?: string;
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
    metrics: [
      { value: 'S$700K+', label: 'platform revenue' },
      { value: '9K+', label: 'delivery orders' },
      { value: '230+', label: 'company accounts' },
    ],
    metricsPeriod: 'All-time GMS totals · September 2026',
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
          'Connect checkout and 305 gifting campaigns to stock reservations, packing, dispatch, and courier tracking. GMS records 8,707 gift sets ordered and 9,032 delivery orders, with an inventory ledger tracing stock and customer-owned inventory.',
      },
      {
        title: 'Payments & accounting',
        description:
          'Support S$717.7K in recorded platform revenue through Stripe payments, company credits, and Xero invoices. Reconciliation and retries recover failed accounting updates while preserving successful payments.',
      },
      {
        title: '2.5K+ vouchers activated · S$25K+ face value',
        description:
          'By August 2026, IG Club Rewards had activated at least 2,542 digital vouchers with S$25,460 in face value across 33M+ reward points, verified in June and August campaign exports. S$5 Lazada vouchers cost 6,500 points. Own points wallets, physical gift redemption, provider integrations, activation retries, expiry rules, and reporting.',
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
    metrics: [
      { value: '~Rp72M', label: 'estimated annual savings' },
      { value: '12', label: 'engineers supported' },
      { value: '19', label: 'UI components documented' },
    ],
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
      {
        name: 'CRM members',
        href: 'https://dashboard.table.link',
        description: 'Rankings, spending & Excel export',
        screenshot: {
          src: '/work/tablelink-crm-members.webp',
          alt: 'TableLink CRM member table with rankings and total spending',
        },
      },
      {
        name: 'Design system',
        href: 'https://dashboard.table.link',
        description: 'shadcn components documented in Storybook',
        screenshot: {
          src: '/work/tablelink-design-system.webp',
          alt: 'TableLink Storybook showing the multi-select component',
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
          'Standardized Next.js and Vite apps with reusable components, authoring Storybook documentation for 19 UI components.',
      },
      {
        title: 'Real-time infrastructure',
        description:
          'Designed shared data infrastructure for synchronized operational tables and live updates.',
      },
      {
        title: 'Code review and releases',
        description:
          'Reduced debt across services and strengthened code review and release practices. Migrated developer tooling for 12 engineers, avoiding an estimated Rp72M in annual licensing costs.',
      },
    ],
  },
  {
    company: 'Farmio',
    status: 'past',
    metrics: [
      { value: '10+', label: 'pages consolidated' },
      { value: '3', label: 'locales supported' },
    ],
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
      {
        name: 'Farmio Fresh',
        href: 'https://apps.apple.com/sg/app/farmio-fresh/id6475751161',
        description: 'Mobile ordering app',
        screenshot: {
          src: '/work/farmio-fresh-app.webp',
          alt: 'Farmio Fresh app screens for cart, notifications, dashboard, and suppliers',
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
          'Consolidated 10+ duplicated pages into shared components and standardized internationalization across three locales.',
      },
    ],
  },
  {
    company: 'BINUS University',
    status: 'past',
    metrics: [
      { value: '~20K', label: 'students per semester' },
      { value: '5,293', label: 'application users' },
      { value: '179', label: 'projects supported' },
    ],
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
          'Shipped evaluation and dashboard features for an internal Vue.js and ASP.NET application used by 5,293 people, with monthly evaluations supporting 179 projects.',
      },
      {
        title: 'Operational reliability',
        description:
          'Maintained the practicum database supporting approximately 20,000 students per semester, operational procedures, and an ASP.NET application used by 161 staff.',
      },
      {
        title: 'Full-stack tooling',
        description:
          'Developed a Next.js and Nest.js application for internal operations.',
      },
    ],
  },
];
