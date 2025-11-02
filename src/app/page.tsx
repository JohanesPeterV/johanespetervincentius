'use client';
import Profile from '@/app/_components/profile';
import { Projects } from '@/app/_components/projects';
import { Summary } from '@/app/_components/summary';
import Technologies from '@/app/_components/technologies';
import WorkExperience from '@/app/_components/work-experience';
import HomeBackground from '@/components/backgrounds/home-background';
import SnapScrollContainer from '@/components/snap-scroll-container';

export default function Home() {
  return (
    <div>
      <SnapScrollContainer className="relative z-10">
        <Profile />
        <WorkExperience />
        <Projects />
        <Technologies />
        <Summary />
      </SnapScrollContainer>
      <HomeBackground />
    </div>
  );
}
