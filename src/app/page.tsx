"use client";
import MacbookShowcase from "@/components/3d/macbook-showcase";
import HomeBackground from "@/components/backgrounds/home-background";
import Links from "@/components/links";
import SnapScrollContainer from "@/components/snap-scroll-container";
import Profile from "@/sections/profile";

export default function Home() {
  return (
    <div>
      <SnapScrollContainer className="relative z-10">
        <Profile />

        <MacbookShowcase>
          <Links />
        </MacbookShowcase>

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
