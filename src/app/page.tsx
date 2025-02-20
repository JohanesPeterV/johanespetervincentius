"use client";
import ThreeBackground from "@/components/background";
import SnapScrollContainer from "@/components/snap-scroll-container";
import Test from "@/components/test";
import Profile from "@/sections/profile";

export default function Home() {
  return (
    <div>
      <main className="relative">
        {/* <Test /> */}
        <ThreeBackground />

        <SnapScrollContainer className="relative z-10">
          <Profile />
          <h1
            className="  scroll-m-20
                font-poppins text-4xl font-bold
                tracking-tight lg:text-6xl
          animate-gradient      text-transparent bg-red bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 bg-clip-text
          
                "
          >
            J hanes Peter Vincentius
            <br />
          </h1>
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
