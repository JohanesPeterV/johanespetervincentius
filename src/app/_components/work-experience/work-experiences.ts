type WorkExperience = {
  company: string;
  headline: string;
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
    headline: 'From product decisions to production ownership.',
    positions: [
      {
        name: 'Lead Software Engineer',
        workPeriod: 'Sep 2025 – Present',
        description:
          'Lead engineering across corporate gifting, digital rewards, and e-commerce. Partner directly with the Founder to turn product and operational needs into reliable systems.',
      },
    ],
    showcases: [
      {
        title: 'End-to-end ownership',
        description:
          'Architecture, database design, vendor integrations, and production reliability.',
      },
      {
        title: 'Engineering leadership',
        description:
          'Onboard engineers and set conventions for code review, testing, and delivery.',
      },
      {
        title: 'AI-assisted delivery',
        description:
          'Build development workflows that extend what a lean engineering team can ship.',
      },
    ],
  },
  {
    company: 'TableLink',
    headline: 'Live venue operations. A stronger engineering foundation.',
    positions: [
      {
        name: 'Full-stack Developer',
        workPeriod: 'Feb – Sep 2025',
        description:
          'Delivered the workflows venues run on: QR ordering, dynamic menus, and real-time guest operations. Improved the shared architecture behind them so the team could build consistently.',
      },
    ],
    showcases: [
      {
        title: 'Real-time infrastructure',
        description:
          'Designed shared data infrastructure for synchronized operational tables and live updates.',
      },
      {
        title: 'Consistent frontend architecture',
        description:
          'Standardized Next.js and Vite apps with reusable components and Storybook.',
      },
      {
        title: 'Healthier delivery',
        description:
          'Reduced debt across services and strengthened code review and release practices.',
      },
    ],
  },
  {
    company: 'Farmio',
    headline: 'Practical AI, shipped into everyday operations.',
    positions: [
      {
        name: 'Software Engineer',
        workPeriod: 'Nov 2023 – Nov 2024',
        description:
          'Shipped one of the team’s first production LLM features: turning free-form WhatsApp messages into structured orders with GPT-3.5. Established code and review conventions as the team grew.',
      },
    ],
    showcases: [
      {
        title: 'Zero-to-launch ownership',
        description:
          'Designed and built the Agent Portal end to end, from authentication to UI.',
      },
      {
        title: 'Price integrity',
        description:
          'Moved checkout pricing to the backend for consistent prices across platforms.',
      },
      {
        title: 'A maintainable foundation',
        description:
          'Consolidated duplicated pages and standardized internationalization across three locales.',
      },
    ],
  },
  {
    company: 'BINUS University',
    headline: 'Building the systems behind the classroom.',
    positions: [
      {
        name: 'Database Administrator · Developer Intern · Teaching Assistant',
        workPeriod: 'Aug 2020 – Feb 2024',
        description:
          'Worked across teaching, full-stack development, and database administration at the Software Lab Center. Built and maintained the tools supporting daily practicum operations.',
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
