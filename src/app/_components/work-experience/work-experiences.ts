type WorkMetric = { value: string; label: string };

export type WorkExperience = {
  company: string;
  status: 'current' | 'past';
  metrics: WorkMetric[];
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
    metrics?: WorkMetric[];
  }[];
};

export const WORK_EXPERIENCES: WorkExperience[] = [
  {
    company: 'Smilie',
    status: 'current',
    metrics: [
      { value: '9K+', label: 'delivery orders managed' },
      { value: '4.5K+', label: 'vouchers activated' },
    ],
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
        name: 'Lead Software Engineer',
        workPeriod: 'Sep 2025 – Present',
        description:
          'Lead engineering delivery across commerce, gifting, and rewards, working directly with the Founder. Own product scope, architecture, workflow design, hands-on implementation, briefs, reviews, and production follow-through. Direct other engineers and remain accountable for the team’s delivery.',
      },
    ],
    showcases: [
      {
        title: 'Gifting & fulfilment',
        metrics: [{ value: '230+', label: 'company accounts' }],
        description:
          'Own corporate gifting end to end, from checkout, Stripe, and company credits through recipient campaigns, stock, automated courier booking, tracking, and Xero reconciliation.',
      },
      {
        title: 'IG vouchers & rewards',
        description:
          'Own provider integrations, points wallets, and digital redemptions, with automatic retries that recover stuck activations.',
      },
      {
        title: 'Custom merchandise',
        metrics: [{ value: '100', label: 'invoiced merchandise jobs' }],
        description:
          'Take orders from quote to production with quantity-based pricing, customer approvals, production documents, inventory reservations, and AI-assisted catalogue imports.',
      },
      {
        title: 'Engineering leadership',
        description:
          'Consolidate duplicated payment and form flows, set testing and review standards, onboard engineers, and design AI-assisted delivery workflows. Keep the stack and subscriptions deliberately lean.',
      },
    ],
  },
  {
    company: 'TableLink',
    status: 'past',
    metrics: [
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
          'Reduced debt across services and strengthened code review and release practices. Migrated developer tooling for 12 engineers.',
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
