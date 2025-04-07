'use client';
import HomeBackground from '@/components/backgrounds/home-background';
import SnapScrollContainer from '@/components/snap-scroll-container';
import Profile from '@/sections/profile';
import { Projects } from '@/sections/projects';
import Technologies from '@/sections/technologies';
import WorkExperience from '@/sections/work-experience';

export default function Home() {
  return (
    <div>
      <SnapScrollContainer className="relative z-10">
        <Profile />

        <WorkExperience />
        <Projects />
        <Technologies />
      </SnapScrollContainer>
      <HomeBackground />
    </div>
  );
}
