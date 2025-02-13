"use client";
import SnapScrollContainer from "@/components/snap-scroll-container";
import Profile from "@/sections/profile";

export default function Home() {
  return (
    <div>
      <main className="bg-card">
        <SnapScrollContainer>
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
