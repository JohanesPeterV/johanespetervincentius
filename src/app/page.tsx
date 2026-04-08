import Profile from '@/app/_components/profile';
import { Projects } from '@/app/_components/projects';
import { Summary } from '@/app/_components/summary';
import Technologies from '@/app/_components/technologies';
import WorkExperience from '@/app/_components/work-experience';
import HomeBackground from '@/components/backgrounds/home-background';
import SnapScrollContainer from '@/components/snap-scroll-container';

const Home = (): React.JSX.Element => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <HomeBackground />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%),linear-gradient(to_bottom,rgba(10,10,10,0.16),rgba(10,10,10,0.32),rgba(10,10,10,0.56))] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%),linear-gradient(to_bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.44),rgba(0,0,0,0.72))]" />
      <SnapScrollContainer className="relative z-10">
        <Profile />
        <WorkExperience />
        <Projects />
        <Technologies />
        <Summary />
      </SnapScrollContainer>
    </div>
  );
};

export default Home;
