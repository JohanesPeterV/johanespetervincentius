import { Metadata } from 'next';

const FULL_NAME = 'Johanes Peter Vincentius';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: `${FULL_NAME} is a Software Engineer and Full Stack Developer specializing in React, Next.js, TypeScript, and modern web technologies. Explore projects and work experience.`,
  alternates: {
    canonical: '/portfolio',
  },
  openGraph: {
    type: 'website',
    url: '/portfolio',
    title: `Portfolio | ${FULL_NAME}`,
    description: `Projects, work experience, and tech stack of ${FULL_NAME} — Software Engineer & Full Stack Developer.`,
  },
};
