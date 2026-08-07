type WorkExperience = {
  company: string;
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
    positions: [
      {
        name: 'Lead Software Engineer',
        workPeriod: '2025-Present',
        description: `Own technical direction end-to-end — architecture, database design, deployment, and reliability — across multi-product systems for corporate gifting, digital rewards, and e-commerce. Drive vendor integrations, partner with the Founder on platform strategy, and build AI-assisted workflows that let a lean team ship like a larger one.`,
      },
    ],
    showcases: [
      {
        title: 'Corporate Gifting Platform',
        description: 'Multi-product gifting flows from catalog to fulfilment.',
      },
      {
        title: 'Digital Rewards',
        description:
          'Reward issuing and redemption across vendor integrations.',
      },
      {
        title: 'AI-Assisted Workflows',
        description: 'Internal AI tooling that lets a lean team ship faster.',
      },
    ],
  },
  {
    company: 'TableLink',
    positions: [
      {
        name: 'Full-stack Developer',
        workPeriod: '2025',
        description: `Delivered core venue SaaS workflows — QR ordering, dynamic menus, and real-time guest operations — and standardized frontend architecture across Next.js/Vite apps with reusable components and Storybook. Built shared real-time data infrastructure for synchronized live updates while cutting technical debt across a microservices stack.`,
      },
    ],
    showcases: [
      {
        title: 'QR Ordering',
        description: 'Scan-to-order flow with dynamic venue menus.',
      },
      {
        title: 'Live Guest Operations',
        description: 'Real-time updates synchronized across venue devices.',
      },
      {
        title: 'Shared Component Library',
        description: 'Reusable UI standardized with Storybook.',
      },
    ],
  },
  {
    company: 'Farmio',
    positions: [
      {
        name: 'Software Engineer',
        workPeriod: '2023-2024',
        description: `Shipped one of the team's first LLM-in-production features — a GPT-3.5 + WhatsApp integration that turned free-form chats into structured orders. Built the Agent Portal end-to-end from auth to UI, moved checkout pricing server-side to guarantee price integrity, and standardized i18n across three locales.`,
      },
    ],
    showcases: [
      {
        title: 'WhatsApp Order Bot',
        description: 'GPT-3.5 turns free-form chats into structured orders.',
      },
      {
        title: 'Agent Portal',
        description: 'Agent-facing portal built end-to-end, auth to UI.',
      },
      {
        title: 'Server-Side Checkout',
        description: 'Pricing moved server-side to guarantee integrity.',
      },
    ],
  },
  {
    company: 'Software Lab Center, Binus',
    positions: [
      {
        name: 'Database Administrator & Teaching Assistant',
        workPeriod: '2020-2024',
        description: `Maintained the practicum database serving ~20,000 students per semester and an ASP.NET app used by 161 staff, and built full-stack tools with Next.js and Nest.js for practicum operations. Earlier, taught programming-based classes to 1,700+ students and shipped Vue.js/ASP.NET features for an internal app with 5,293 users.`,
      },
    ],
    showcases: [
      {
        title: 'Practicum Operations Tools',
        description: 'Full-stack Next.js and Nest.js internal tooling.',
      },
      {
        title: 'Practicum Database',
        description: 'Database serving ~20,000 students per semester.',
      },
      {
        title: 'Staff Application',
        description: 'ASP.NET app used daily by 161 staff.',
      },
    ],
  },
];
