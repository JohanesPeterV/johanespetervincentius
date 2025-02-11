import SnapScrollContainer from "./components/snap-scroll-container";

export default function Home() {
  return (
    <div>
      <main className="no-scrollbar bg-black scrollbar-hide">
        <SnapScrollContainer>
          <div className="h-full w-full text-white bg-slate-600">
            <div>content </div>
          </div>
          <div className="h-full w-full text-white bg-red-950">
            <div>content 2</div>
          </div>
          <div className="h-full w-full text-white bg-slate-600">
            <div>content 3</div>
          </div>
          <div className="h-full w-full text-white bg-red-950">
            <div>content 4</div>
          </div>
        </SnapScrollContainer>
      </main>
    </div>
  );
}
