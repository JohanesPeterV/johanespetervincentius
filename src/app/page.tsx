'use client';
import HomeBackground from '@/components/backgrounds/home-background';
import SnapScrollContainer from '@/components/snap-scroll-container';
import Profile from '@/sections/profile';
import { Projects } from '@/sections/projects';
import WorkExperience from '@/sections/work-experience';

export default function Home() {
  return (
    <div>
      <SnapScrollContainer className="relative z-10">
        <Profile />

        <WorkExperience />
        <Projects />

        <div className="h-full w-full text-foreground ">
          <div>content 2</div>
        </div>
        <div className="h-full w-full text-card ">
          <div>content 3</div>
        </div>
        <div className="h-full w-full ">
          <div>content 4</div>
        </div>
      </SnapScrollContainer>
      <HomeBackground />
    </div>
  );
}
