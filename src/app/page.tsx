"use client";
import HomeBackground from "@/components/backgrounds/home-background";
import SnapScrollContainer from "@/components/snap-scroll-container";
import Profile from "@/sections/profile";

export default function Home() {
  return (
    <div>
      <main className="relative">
        <HomeBackground />
        <SnapScrollContainer className="relative z-10">
          <Profile />

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
      </main>
    </div>
  );
}
