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
      { value: 'S$569K+', label: 'commercial value' },
      { value: '99M+', label: 'net gift points' },
      { value: '4.5K+', label: 'vouchers activated' },
    ],
    metricsPeriod: 'Jan–Sep 2026 · Production records reviewed 1 October 2026',
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
        title: 'Custom merchandise',
        metrics: [{ value: '100', label: 'invoiced merchandise jobs' }],
        description:
          'Build proposals, quantity-based pricing, customer approvals, revised quotes, production documents, and inventory reservations. January–September 2026 records include 100 invoiced merchandise jobs with S$281,597.83 in stored customer billing value.',
      },
      {
        title: 'Gifting & fulfilment',
        metrics: [
          { value: '9K+', label: 'delivery orders managed' },
          { value: '8.7K+', label: 'gift sets ordered' },
          { value: '230+', label: 'company accounts' },
        ],
        description:
          'Connect checkout, recipient campaigns, stock reservations, packing, dispatch, and tracking. The September 2026 all-time GMS snapshot records 9,032 delivery orders, 8,707 gift sets ordered, 232 company accounts, and 305 campaigns. Delivery orders cover multiple lifecycle stages.',
      },
      {
        title: 'Payments & accounting',
        metrics: [
          { value: 'S$287K+', label: 'paid gift charges' },
          { value: 'S$281K+', label: 'invoiced merchandise value' },
          { value: '544', label: 'paid gift orders' },
        ],
        description:
          'Support S$569,373.46 in January–September 2026 commercial value: S$287,775.63 in paid gift charges plus S$281,597.83 in invoiced merchandise. Connect Stripe, company credits, Xero, and reconciliation. The measure uses order creation cohorts and stored billing status; merchandise invoicing does not establish cash collection.',
      },
      {
        title: 'Commercial value by quarter',
        metrics: [
          { value: '111.7K', label: 'Q1 2026, SGD' },
          { value: '76.0K', label: 'Q2 2026, SGD' },
          { value: '381.6K', label: 'Q3 2026, SGD' },
        ],
        description:
          'Calendar-quarter totals reconcile to S$569,373.46. Q3 includes S$140,431.70 of imported Mooncake paid charges. These figures show the commercial scale supported by the systems and include contributions from sales, procurement, and operations.',
      },
      {
        title: 'Recorded value since late 2025',
        metrics: [
          { value: 'S$645K+', label: 'Q4 2025–Q3 2026 commercial value' },
        ],
        description:
          'Retained paid gift charges and invoiced merchandise total S$645,456.96 across Q4 2025–Q3 2026. This includes the January–September total above; retained Neon orders begin in November 2025.',
      },
      {
        title: 'Courier automation',
        metrics: [
          { value: '5,879', label: 'noncancelled SPX bookings' },
          { value: '5,752', label: 'booked parcels marked delivered' },
        ],
        description:
          'Build batch courier booking, labels, dispatch, and tracking callbacks. January–September 2026 booking cohorts contain 5,879 noncancelled SPX bookings, with 5,752 marked delivered at the October snapshot.',
      },
      {
        title: 'IG digital voucher delivery',
        metrics: [
          { value: '4,527', label: 'successful digital activations' },
          { value: 'S$43K+', label: 'activated voucher face value' },
        ],
        description:
          'Own provider integrations, redemption reporting, expiry rules, and activation recovery. January–September 2026 provider activation records contain 4,527 successful vouchers with S$43,145 in face value and unique provider order IDs. Activation establishes issuance; retailer spending is a separate event.',
      },
      {
        title: 'IG points wallets & rewards',
        metrics: [
          { value: '99.24M', label: 'gift points after refunds' },
          { value: 'S$76.3K', label: 'voucher-equivalent gift budget' },
        ],
        description:
          'Manage points wallets, refunds, physical gifts, and digital redemptions. January–September gift purchases total 100,003,900 points, less 760,500 refunded points. At 6,500 points per S$5 voucher, the net budget is S$76,341.08 equivalent. Physical-gift pricing differs, and this conversion measures a reference budget. It overlaps activated vouchers.',
      },
      {
        title: 'Provider failure recovery',
        metrics: [{ value: '15', label: 'retried vouchers later activated' }],
        description:
          'Build automatic activation retries and follow through on stuck provider orders. Fifteen vouchers with recorded retry attempts ultimately activated, representing S$75 in face value. Require an authoritative provider outcome before another redemption attempt.',
      },
      {
        title: 'Modeled operational capacity',
        metrics: [
          { value: '~208h', label: 'modeled staff capacity' },
          { value: '~S$4.2K', label: 'modeled capacity value' },
        ],
        description:
          'A January–September scenario estimates 208.47 hours and S$4,169.33 of staff capacity. Assumptions: two net minutes per SPX booking, 15 minutes per invoiced-job document task, 50% document adoption, and S$20 per hour. Handling times and adoption remain unmeasured; payroll cash savings are unquantified.',
      },
      {
        title: 'Technology spending decisions',
        metrics: [
          { value: 'US$240', label: 'annualized Vercel seat reduction' },
          { value: 'US$25', label: 'monthly Clerk reduction candidate' },
        ],
        description:
          'Reduce Vercel deploying seats from three to two, avoiding US$20 per month in recurring seat cost. Retained Clerk billing configuration and downgrade evidence support a US$25 monthly base-plan reduction candidate from September. Historical paid-quarter cash savings are unreconciled.',
      },
      {
        title: 'Catalogue automation',
        description:
          'Turn supplier data into product listings with reusable import tools and AI-assisted categorisation, copy, and SEO. Validate structured output and flag uncertain results for review.',
      },
      {
        title: 'Engineering foundations',
        metrics: [
          { value: '2 → 1', label: 'shared form-submission owner' },
          { value: '3 → 1', label: 'payment settlement owner' },
        ],
        description:
          'Consolidate duplicated storefront/GMS form submission and unify webhook, customer-return, and reconciliation settlement. Repay payment, inventory, and form debt while shipping Xero, fulfilment, and finance features. Establish database/browser tests, review standards, implementation briefs, and engineer onboarding.',
      },
      {
        title: 'AI-assisted engineering at scale',
        metrics: [
          { value: '30.8B', label: 'recorded Smilie input + output tokens' },
          { value: '118.6M', label: 'recorded Smilie output tokens' },
          { value: '56.4B', label: 'lifetime Codex profile tokens' },
        ],
        description:
          'Design rules and workflows for AI-assisted implementation, delegation, and verification. Retained January–September 2026 Smilie Codex/Claude logs record 30.8B input-plus-output tokens, including cached context, and 118.6M output tokens, including reasoning. Separately, the October Codex profile shows 56.4B lifetime tokens across projects. These activity measures have different, overlapping scopes.',
      },
      {
        title: 'Product & architecture judgment',
        description:
          'Challenge infrastructure tenancy per customer company and retain company membership/access controls within a shared GMS dataset. Deliberately separate the future Giftstack product from Smilie-specific workflows. Own product sequencing, interface design, hiring input, and founder/provider follow-through alongside implementation.',
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
