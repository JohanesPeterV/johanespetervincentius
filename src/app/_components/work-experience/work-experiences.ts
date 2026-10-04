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
          'Lead commerce, gifting, and rewards engineering with the Founder. Own scope, architecture, workflows, implementation, briefs, reviews, and production delivery; direct engineers and stay accountable for team outcomes.',
      },
    ],
    showcases: [
      {
        title: 'Gifting & fulfilment',
        metrics: [{ value: '230+', label: 'company accounts' }],
        description:
          'Own gifting from Stripe checkout and company credits to recipient campaigns, stock, automated courier booking, tracking, and Xero reconciliation.',
      },
      {
        title: 'IG vouchers & rewards',
        description:
          'Own provider integrations, points wallets, and digital redemptions; recover stuck activations with automatic retries.',
      },
      {
        title: 'Custom merchandise',
        metrics: [{ value: '100', label: 'invoiced merchandise jobs' }],
        description:
          'Own quote-to-production workflows: quantity pricing, customer approvals, production documents, inventory reservations, and AI-assisted catalogue imports.',
      },
      {
        title: 'Engineering leadership',
        description:
          'Unify payment and form flows, set testing and review standards, onboard engineers, and design AI-assisted delivery. Keep the stack and subscriptions lean.',
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
          'Shipped QR ordering, dynamic menus, and real-time guest operations on a shared architecture.',
      },
    ],
    showcases: [
      {
        title: 'Shared frontend architecture',
        description:
          'Unified Next.js and Vite apps with reusable components; documented 19 UI components in Storybook.',
      },
      {
        title: 'Real-time infrastructure',
        description:
          'Designed shared data infrastructure to synchronize operational tables and live updates.',
      },
      {
        title: 'Code review and releases',
        description:
          'Reduced service debt, strengthened reviews and releases, and migrated developer tooling for 12 engineers.',
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
          'Automated WhatsApp-to-order with GPT-3.5; established code and review conventions for a growing team.',
      },
    ],
    showcases: [
      {
        title: 'Agent Portal',
        description:
          'Designed and built the Agent Portal end to end, including authentication and UI.',
      },
      {
        title: 'Price integrity',
        description:
          'Centralized checkout pricing in the backend for consistent prices across platforms.',
      },
      {
        title: 'Shared components and localization',
        description:
          'Replaced 10+ duplicated pages with shared components; standardized internationalization across three locales.',
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
