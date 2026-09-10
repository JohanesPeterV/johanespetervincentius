'use client';
import Profile from '@/app/_components/profile';
import { Projects } from '@/app/_components/projects';
import { Summary } from '@/app/_components/summary';
import WorkExperience from '@/app/_components/work-experience';
import HomeBackground from '@/components/backgrounds/home-background';
import SnapScrollContainer from '@/components/snap-scroll-container';
import PalettePicker from '@/components/theme-buttons/palette-picker';

export default function PortfolioView() {
  return (
    <div>
      <SnapScrollContainer className="relative z-10">
        <Profile />
        <WorkExperience />
        <Projects />
        <Summary />
      </SnapScrollContainer>
      <PalettePicker />
      <HomeBackground />
    </div>
  );
}
